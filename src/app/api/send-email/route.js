import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    try {
        const dataF = await req.json();

        const data = await resend.emails.send({
            from: 'info@algo-market.com',
            to: 'prodseoy@gmail.com',
            subject: 'Новая заявка с сайта ALGO',
            html: `
                <h2>Новая заявка с сайта ALGO MARKET</h2>
                <p><strong>Название бота:</strong> ${dataF.botName}</p>
                <p><strong>Связь через:</strong> ${dataF.contactChanel}</p>
                <p><strong>Имя:</strong> ${dataF.userName}</p>
                <p><strong>Аккаунт или почта:</strong> ${dataF.account}</p>
            `
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}