export function shopUuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) {
    throw new Error('Invalid Tribute order UUID');
  }
  return value.toLowerCase();
}

export function paymentUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Missing web payment URL');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !(url.hostname === 'tribute.tg' || url.hostname.endsWith('.tribute.tg'))) {
    throw new Error('Unexpected Tribute payment URL');
  }
  return url.toString();
}

export function verifyPaidPayload(p: any, s: any) {
  if (!p || shopUuid(p.uuid) !== s.tribute_uuid || p.shopId !== Number(s.shop_id) ||
      p.status !== 'paid' || p.isRecurrent !== false || p.isTrial === true ||
      (p.period !== undefined && p.period !== 'onetime') ||
      p.onlyStars === true || (p.firstPeriodAmount !== undefined && p.firstPeriodAmount !== null) ||
      !Number.isSafeInteger(p.amount) || p.amount <= 0 || p.amount !== Number(s.amount_cents) ||
      p.currency !== 'usd' || s.currency !== 'USD') {
    throw new Error('Tribute payment does not match saved order');
  }
  if (p.customerId !== undefined && p.customerId !== s.id) throw new Error('Customer reference mismatch');
  if (p.email && (typeof p.email !== 'string' || p.email.trim().toLowerCase() !== s.email)) {
    throw new Error('Tribute customer email mismatch');
  }
}
