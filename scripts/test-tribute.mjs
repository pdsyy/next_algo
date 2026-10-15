// Synthetic test event ONLY. It never proves a real payment.
import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
if (process.env.TRIBUTE_TEST_MODE !== 'true') throw new Error('Set TRIBUTE_TEST_MODE=true locally AND on the deployment');
const sql=neon(process.env.DATABASE_URL);
const rows=await sql`SELECT * FROM aw_tribute_sessions WHERE account=${process.env.TRIBUTE_ACCOUNT_ID}
    AND test_mode=true AND state='bound' ORDER BY created_at DESC LIMIT 1`;
const s = rows[0];
if(!s) throw new Error('First create a test Aero checkout and link it using the Telegram bot');
const token=s.id.replaceAll('-','')+'_'+crypto.createHmac('sha256',process.env.TRIBUTE_SESSION_SECRET).update(s.id).digest('base64url').slice(0,24);
const status=await fetch(new URL('/api/payments/tribute/status',process.env.APP_URL),{headers:{Authorization:`Bearer ${token}`}});
const live=await status.json();
if(!status.ok||live.testMode!==true||live.orderCode!==s.order_code)throw new Error('Remote session is not the expected TEST session');
const now=new Date().toISOString();
if(String(s.product_id)!==process.env.TRIBUTE_AERO_SUBSCRIPTION_ID || String(s.period_id)!==process.env.TRIBUTE_AERO_PERIOD_ID) throw new Error('Create a NEW subscription checkout with the current tariff');
const event={name:'new_subscription',created_at:now,sent_at:now,payload:{
    subscription_id:Number(s.product_id),subscription_name:'Aero (synthetic test)',
    period_id:Number(s.period_id),period:'onetime',type:'regular',
    price:Number(s.amount_cents),amount:Math.floor(Number(s.amount_cents)*0.9),currency:s.currency.toLowerCase(),
    telegram_user_id:Number(s.telegram_id),
}};
const raw=JSON.stringify(event);
const response=await fetch(new URL('/api/payments/tribute/webhook',process.env.APP_URL),{
    method:'POST',headers:{'Content-Type':'application/json','trbt-signature':crypto.createHmac('sha256',process.env.TRIBUTE_API_KEY).update(raw).digest('hex')},body:raw,
});
console.log('Synthetic test:',response.status,await response.text());
