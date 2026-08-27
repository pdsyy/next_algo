const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

export interface CreatePaymentParams {
    priceAmount: number;
    priceCurrency: string;
    payCurrency: string;
    orderId: string;
    description?: string;
}

export async function createNowPayment({
                                           priceAmount,
                                           priceCurrency,
                                           payCurrency,
                                           orderId,
                                           description,
                                       }: CreatePaymentParams) {
    const response = await fetch(
        `${NOWPAYMENTS_API_URL}/payment`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
            },

            body: JSON.stringify({
                price_amount: priceAmount,
                price_currency: priceCurrency,
                pay_currency: payCurrency,

                order_id: orderId,

                order_description:
                    description || `Algo Bots order ${orderId}`,

                ipn_callback_url:
                    `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/nowpayments/webhook`,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("NOWPayments:", data);

        throw new Error(
            data?.message || "NOWPayments payment creation failed"
        );
    }

    return data;
}

export async function getNowPaymentStatus(
    paymentId: string
) {
    const response = await fetch(
        `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
        {
            headers: {
                "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
            },

            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.message || "Unable to get payment status"
        );
    }

    return data;
}