import crypto from 'crypto';
import { db, required, tokenFor } from './tribute';
import { cents, extractOrder } from './tribute-core';
import { getCmlOrder, recordCmlPayment } from './cml';
import { sendPurchaseEmailNotification } from './order-email';
import { paymentUrl, shopUuid, verifyPaidPayload } from './tribute-shop-core';

export function shopId() {
  const value = required('TRIBUTE_SHOP_ID');
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Invalid TRIBUTE_SHOP_ID');
  return Number(value);
}
function liveMode() {
  if (process.env.TRIBUTE_TEST_MODE !== 'false') {
    throw new Error('Tribute checkout is disabled in test mode. No real payment order was created.');
  }
}
export function shopReturnUrl(id: string) {
  const base = new URL(required('APP_URL'));
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('APP_URL must be HTTPS');
  return new URL(`/checkout/tribute#token=${tokenFor(id)}`, base.origin).toString();
}
async function request(path: string, body?: unknown) {
  const response = await fetch(`https://tribute.tg/api/v1${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Api-Key': required('TRIBUTE_API_KEY'), 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store', signal: AbortSignal.timeout(10000), redirect: 'error',
  });
  if (!response.ok) throw new Error(`Tribute API HTTP ${response.status}`);
  return response.json();
}
export async function checkTributeShop() {
  liveMode();
  const id = shopId();
  const shops = await request('/shops');
  const shop = Array.isArray(shops) ? shops.find((s: any) => s.id === id) : null;
  const callback = new URL('/api/payments/tribute/webhook', new URL(required('APP_URL')).origin).toString();
  if (!shop || shop.status !== 1 || shop.onlyStars !== false || shop.callbackUrl !== callback) {
    throw new Error('Tribute shop is inactive or payment/webhook settings do not match');
  }
}
async function expireUncertain(id: string) {
  const sql = db();
  await sql`UPDATE aw_tribute_shop_sessions SET state='manual_review',
    note='Interrupted creation or fulfillment: reconcile before retrying', updated_at=now()
    WHERE id=${id} AND state IN ('creating','processing') AND updated_at < now() - interval '2 minutes'`;
}
export async function shopSessionByToken(token: string) {
  if (!/^[a-f0-9]{32}_[A-Za-z0-9_-]{24}$/.test(token)) return null;
  const short = token.slice(0,32);
  const id = `${short.slice(0,8)}-${short.slice(8,12)}-${short.slice(12,16)}-${short.slice(16,20)}-${short.slice(20)}`;
  if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(tokenFor(id)))) return null;
  await expireUncertain(id);
  const sql = db();
  return (await sql`SELECT * FROM aw_tribute_shop_sessions WHERE id=${id} AND shop_id=${shopId()}`)[0] ?? null;
}
export function publicShopSession(s: any) {
  return { token: tokenFor(s.id), orderCode: s.order_code, testMode: false,
    paymentUrl: s.state === 'pending' && s.payment_url ? paymentUrl(s.payment_url) : null,
    state: s.state };
}
export async function createShopSession(order: {code: string; amount: number; currency: string}, reference: string, email: string) {
  liveMode();
  const id = shopId();
  const amount = cents(order.amount);
  if (order.currency !== 'USD') throw new Error('Only USD is supported');
  const sql = db();
  // Do not silently migrate or re-charge any checkout already handled by the legacy flow.
  const legacy = await sql`SELECT 1 FROM aw_tribute_sessions
    WHERE order_code=${order.code} OR checkout_reference=${reference} LIMIT 1`;
  if (legacy.length) throw new Error('This checkout belongs to the previous payment flow. Contact support before paying.');
  let s = (await sql`INSERT INTO aw_tribute_shop_sessions
    (shop_id,checkout_reference,order_code,email,amount_cents,currency)
    VALUES (${id},${reference},${order.code},${email},${amount},'USD')
    ON CONFLICT (shop_id,checkout_reference) DO UPDATE SET checkout_reference=EXCLUDED.checkout_reference
    RETURNING *`)[0];
  if (s.order_code !== order.code || s.email !== email || Number(s.amount_cents) !== amount || s.currency !== 'USD') {
    throw new Error('Checkout reference belongs to a different order');
  }
  if (['pending','paid'].includes(s.state)) return publicShopSession(s);
  if (s.state !== 'created') throw new Error('Payment preparation is in progress or requires support review. Do not create another payment.');
  const claimed = await sql`UPDATE aw_tribute_shop_sessions SET state='creating',updated_at=now()
    WHERE id=${s.id} AND state='created' RETURNING *`;
  if (!claimed.length) throw new Error('Payment preparation is already in progress');
  try {
    const result = await request('/shop/orders', {
      shopId: id, amount, currency: 'usd', title: 'Aero',
      description: `Aero lifetime license. Order ${order.code}`,
      period: 'onetime', email, customerId: s.id,
      successUrl: shopReturnUrl(s.id), failUrl: shopReturnUrl(s.id),
    });
    const uuid = shopUuid(result.uuid);
    const url = paymentUrl(result.paymentUrl);
    if (result.shopId !== id || result.amount !== amount || result.currency !== 'usd' ||
        result.period !== 'onetime' || result.status !== 'pending' || result.onlyStars === true) {
      throw new Error('Unexpected Tribute order response');
    }
    s = (await sql`UPDATE aw_tribute_shop_sessions SET tribute_uuid=${uuid},payment_url=${url},
      state=CASE WHEN EXISTS(SELECT 1 FROM aw_tribute_shop_blocks WHERE shop_id=${id} AND tribute_uuid=${uuid})
      THEN 'manual_review' ELSE 'pending' END,updated_at=now()
      WHERE id=${s.id} AND state='creating' RETURNING *`)[0];
    if (!s) throw new Error('Order mapping was not saved');
    return publicShopSession(s);
  } catch (error) {
    // POST is not retried: a timeout may have happened AFTER the provider created the order.
    await sql`UPDATE aw_tribute_shop_sessions SET state='manual_review',
      note='Order creation result uncertain. Inspect Tribute orders by customerId before any retry.',updated_at=now()
      WHERE id=${claimed[0].id} AND state='creating'`;
    console.error('TRIBUTE SHOP CREATE REQUIRES REVIEW', { sessionId: claimed[0].id });
    throw error;
  }
}
async function block(shop: number, uuid: string, reason: string) {
  const sql = db();
  await sql.transaction([
    sql`INSERT INTO aw_tribute_shop_blocks(shop_id,tribute_uuid,reason) VALUES(${shop},${uuid},${reason})
      ON CONFLICT(shop_id,tribute_uuid) DO NOTHING`,
    sql`UPDATE aw_tribute_shop_sessions SET state='manual_review',note=${reason},updated_at=now()
      WHERE shop_id=${shop} AND tribute_uuid=${uuid}`,
  ]);
}
export async function handleShopEvent(body: any, raw: string) {
  const names = ['shop_order','shop_order_refunded','shop_order_cancelled','shop_order_payment_failed'];
  if (!names.includes(body?.name)) return { ignored: true };
  const p = body.payload;
  if (!p || !Number.isSafeInteger(p.shopId)) throw new Error('Missing shop ID');
  if (p.shopId !== shopId()) return { ignored: true };
  const uuid = shopUuid(p.uuid);
  const sql = db();
  const digest = crypto.createHash('sha256').update(raw).digest('hex');
  await sql`INSERT INTO aw_tribute_shop_events(digest,shop_id,tribute_uuid,event_name)
    VALUES(${digest},${p.shopId},${uuid},${body.name}) ON CONFLICT DO NOTHING`;
  // This log is not a delivery lock: failed processing must be retried even when logged.
  if (body.name === 'shop_order_refunded' || body.name === 'shop_order_cancelled') {
    await block(p.shopId, uuid, `${body.name}: reconcile payment and CML license manually`);
    return { state: 'manual_review' };
  }
  if (body.name === 'shop_order_payment_failed') return { ignored: true };
  const s = (await sql`SELECT * FROM aw_tribute_shop_sessions WHERE shop_id=${p.shopId} AND tribute_uuid=${uuid}`)[0];
  // A webhook may arrive before the create-order response was saved; ask Tribute to retry.
  if (!s) throw new Error('Order mapping not available');
  try { verifyPaidPayload(p, s); } catch {
    await block(p.shopId, uuid, 'Signed payment does not match saved order');
    return { state: 'manual_review' };
  }
  if (['paid','manual_review'].includes(s.state)) return { state: s.state };
  liveMode();
  if (s.state === 'processing') {
    await expireUncertain(s.id);
    throw new Error('Fulfillment already in progress; retry later');
  }
  const claimed = await sql`UPDATE aw_tribute_shop_sessions SET state='processing',updated_at=now()
    WHERE id=${s.id} AND state='pending' AND NOT EXISTS (
      SELECT 1 FROM aw_tribute_shop_blocks WHERE shop_id=${p.shopId} AND tribute_uuid=${uuid}) RETURNING id`;
  if (!claimed.length) throw new Error('Order is blocked or currently being processed');
  try {
    const order = extractOrder(await getCmlOrder(s.order_code));
    if (!order || ![1,2].includes(Number(order.status)) || String(order.currency).toUpperCase() !== 'USD' ||
        cents(order.final_amount) !== Number(s.amount_cents)) throw new Error('CML order status or amount mismatch');
    const customer = order.customer ?? order.customer_data ?? {};
    const email = customer.email ?? order.customer_email ?? order.email;
    if (typeof email !== 'string' || email.trim().toLowerCase() !== s.email) throw new Error('CML customer mismatch');
    if ((await sql`SELECT 1 FROM aw_tribute_shop_blocks WHERE shop_id=${p.shopId} AND tribute_uuid=${uuid}`).length) {
      throw new Error('Refund or cancellation requires review');
    }
    // Stable UUID identifies this one-time payment. Never replay an ambiguous CML write.
    await recordCmlPayment({orderCode:s.order_code,provider:'tribute',providerTransactionId:uuid,
      amount:Number(s.amount_cents)/100,paymentMethod:'tribute',externalReference:`tribute:shop:${p.shopId}:${uuid}`});
    const paid = extractOrder(await getCmlOrder(s.order_code));
    if (Number(paid?.status) !== 3) throw new Error('CML did not confirm Paid');
    const done = await sql`UPDATE aw_tribute_shop_sessions SET state='paid',updated_at=now()
      WHERE id=${s.id} AND state='processing' AND NOT EXISTS (
        SELECT 1 FROM aw_tribute_shop_blocks WHERE shop_id=${p.shopId} AND tribute_uuid=${uuid}) RETURNING id`;
    if (!done.length) return {state:'manual_review'};
    try {
      const lines = order.items ?? order.order_items ?? order.lines ?? [];
      await sendPurchaseEmailNotification({orderCode:s.order_code,paymentId:uuid,amount:Number(s.amount_cents)/100,
        currency:'USD',payCurrency:'tribute',email:s.email,
        customerName:[customer.first_name ?? customer.firstName,customer.last_name ?? customer.lastName].filter(Boolean).join(' '),
        products:lines.map((line:any)=>line.product?.title ?? line.product?.name ?? line.title ?? line.name ?? 'Aero')});
    } catch { console.error('TRIBUTE SHOP EMAIL NOT SENT',{orderCode:s.order_code}); }
    return {state:'paid'};
  } catch {
    await block(p.shopId,uuid,'CML result requires reconciliation. Do not repeat payment automatically.');
    console.error('TRIBUTE SHOP CML REVIEW REQUIRED',{orderCode:s.order_code,tributeUuid:uuid});
    return {state:'manual_review'};
  }
}
