const IS_SANDBOX =
    process.env.NOWPAYMENTS_MODE === "sandbox";


const NOWPAYMENTS_API_URL =
    IS_SANDBOX
        ? "https://api-sandbox.nowpayments.io/v1"
        : "https://api.nowpayments.io/v1";


function getNowPaymentsApiKey() {
    const apiKey =
        IS_SANDBOX
            ? process.env.NOWPAYMENTS_SANDBOX_API_KEY
            : process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
        throw new Error(
            IS_SANDBOX
                ? "NOWPAYMENTS_SANDBOX_API_KEY is missing"
                : "NOWPAYMENTS_API_KEY is missing"
        );
    }

    return apiKey;
}


export interface CreatePaymentParams {
    priceAmount: number;
    priceCurrency: string;
    payCurrency: string;
    orderId: string;
    description?: string;
}


/* =========================
   CREATE PAYMENT
========================= */

export async function createNowPayment({
                                           priceAmount,
                                           priceCurrency,
                                           payCurrency,
                                           orderId,
                                           description,
                                       }: CreatePaymentParams) {

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        throw new Error(
            "NEXT_PUBLIC_SITE_URL is missing"
        );
    }


    const cleanSiteUrl =
        siteUrl.replace(/\/+$/, "");


    const ipnCallbackUrl =
        `${cleanSiteUrl}/api/payments/nowpayments/webhook`;


    console.log(
        "NOWPAYMENTS CREATE CONFIG:",
        {
            mode:
                IS_SANDBOX
                    ? "sandbox"
                    : "production",

            apiUrl:
            NOWPAYMENTS_API_URL,

            orderId,

            priceAmount,

            priceCurrency,

            payCurrency,

            ipnCallbackUrl,
        }
    );


    const requestBody = {
        price_amount:
        priceAmount,

        price_currency:
            priceCurrency.toLowerCase(),

        pay_currency:
            payCurrency.toLowerCase(),

        order_id:
        orderId,

        order_description:
            description ??
            `Algo Bots order ${orderId}`,

        ipn_callback_url:
        ipnCallbackUrl,
    };


    const response =
        await fetch(
            `${NOWPAYMENTS_API_URL}/payment`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-api-key":
                        getNowPaymentsApiKey(),
                },

                body:
                    JSON.stringify(
                        requestBody
                    ),

                cache: "no-store",
            }
        );


    const text =
        await response.text();


    let data: any;

    try {
        data =
            JSON.parse(text);
    } catch {
        data =
            text;
    }


    if (!response.ok) {

        console.error(
            "NOWPAYMENTS CREATE ERROR:",
            {
                status:
                response.status,

                data,
            }
        );


        throw new Error(
            data?.message ??
            data?.error ??
            `NOWPayments payment creation failed: ${response.status}`
        );
    }


    console.log(
        `NOWPayments ${
            IS_SANDBOX
                ? "SANDBOX"
                : "PRODUCTION"
        } payment created:`,
        data
    );


    return data;
}


/* =========================
   GET PAYMENT STATUS
========================= */

export async function getNowPaymentStatus(
    paymentId: string
) {

    if (!paymentId) {
        throw new Error(
            "paymentId is required"
        );
    }


    const response =
        await fetch(
            `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
            {
                method: "GET",

                headers: {
                    "x-api-key":
                        getNowPaymentsApiKey(),
                },

                cache: "no-store",
            }
        );


    const text =
        await response.text();


    let data: any;

    try {
        data =
            JSON.parse(text);
    } catch {
        data =
            text;
    }


    if (!response.ok) {

        console.error(
            "NOWPAYMENTS STATUS ERROR:",
            {
                status:
                response.status,

                paymentId,

                data,
            }
        );


        throw new Error(
            data?.message ??
            data?.error ??
            `Unable to get payment status: ${response.status}`
        );
    }


    console.log(
        "NOWPAYMENTS PAYMENT STATUS:",
        {
            paymentId,

            mode:
                IS_SANDBOX
                    ? "sandbox"
                    : "production",

            status:
            data?.payment_status,
        }
    );


    return data;
}