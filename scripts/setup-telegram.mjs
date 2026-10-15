// Run explicitly after deploying the routes: node --env-file=.env.local scripts/setup-telegram.mjs
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const origin = new URL(process.env.APP_URL);
if (!token || !secret || !/^[A-Za-z0-9_-]{32,256}$/.test(secret) || origin.protocol !== 'https:') {
    throw new Error('Set TELEGRAM_BOT_TOKEN, a random TELEGRAM_WEBHOOK_SECRET and an HTTPS APP_URL');
}
async function call(method, body) {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(`Telegram ${method} failed; check bot settings`);
    return data.result;
}
const url = new URL('/api/telegram/webhook', origin).href;
const current = await call('getWebhookInfo', {});
if (current.url && current.url !== url && !process.argv.includes('--replace')) {
    throw new Error('This bot already has a different webhook. Review it; use --replace only to intentionally switch it.');
}
await call('setWebhook',{url,secret_token:secret,allowed_updates:['message'],drop_pending_updates:false});
console.log('Telegram webhook configured:',url);
