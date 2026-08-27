import crypto from "crypto";

const CML_API_URL =
    "https://vwqretlvkrravzguxydw.functions.eu-west-2.nhost.run/v1";

const CML_CHANNEL = "algo-bots";

function createCmlHeaders(rawBody: string) {
    const apiKey = process.env.CML_API_KEY;
    const apiSecret = process.env.CML_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new Error("CML API credentials are missing");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();

    const bodyHash = crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("hex");

    const canonicalString =
        `${apiKey}.${timestamp}.${bodyHash}`;

    const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(canonicalString)
        .digest("base64");

    return {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-API-Timestamp": timestamp,
        "X-API-Signature": signature,
    };
}


/* =========================
   GENERIC CML REQUEST
========================= */

async function cmlRequest<T = any>(
    endpoint: string,
    payload: Record<string, any>
): Promise<T> {

    const body = JSON.stringify(payload);

    const response = await fetch(
        `${CML_API_URL}${endpoint}`,
        {
            method: "POST",
            headers: createCmlHeaders(body),
            body,
            cache: "no-store",
        }
    );

    const text = await response.text();

    let data: any;

    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    if (!response.ok) {
        console.error(
            `CML ERROR ${endpoint}:`,
            response.status,
            data
        );

        const message =
            data?.error?.message ||
            data?.message ||
            text ||
            `CML request failed: ${response.status}`;

        throw new Error(message);
    }

    return data;
}


/* =========================
   CATALOG
========================= */

export async function getCmlProducts(
    countryCode?: string
) {
    return cmlRequest(
        "/sales-channel/catalog",
        {
            channel: CML_CHANNEL,

            ...(countryCode
                ? {
                    country_code:
                        countryCode.toUpperCase(),
                }
                : {}),
        }
    );
}


/* =========================
   FIND PRODUCT
========================= */

export async function getCmlProductByCode(
    productCode: string
) {
    const catalog =
        await getCmlProducts();

    const data =
        catalog?.success;

    if (!data?.available) {
        throw new Error(
            "CML catalog is not available"
        );
    }

    const product =
        data.products?.find(
            (item: any) =>
                item.code === productCode ||
                item.product?.code === productCode
        );

    if (!product) {
        throw new Error(
            `CML product "${productCode}" not found`
        );
    }

    return product;
}


/* =========================
   CREATE CUSTOMER
========================= */

interface CreateCustomerParams {
    email: string;
    firstName: string;
    lastName: string;
    countryCode?: string;
}

export async function createCmlCustomer({
                                            email,
                                            firstName,
                                            lastName,
                                            countryCode,
                                        }: CreateCustomerParams) {

    return cmlRequest(
        "/order/customer",
        {
            customer: {
                email,
                first_name: firstName,
                last_name: lastName,
                type: "Individual",

                ...(countryCode
                    ? {
                        country_code:
                            countryCode.toUpperCase(),
                    }
                    : {}),
            },
        }
    );
}


/* =========================
   CREATE ORDER
========================= */

interface CreateOrderParams {
    customerId: number;
    productId: number;
}

export async function createCmlOrder({
                                         customerId,
                                         productId,
                                     }: CreateOrderParams) {

    return cmlRequest(
        "/order/submit",
        {
            order: {
                customer_id: customerId,

                sales_channel:
                CML_CHANNEL,

                items: [
                    {
                        product_id:
                        productId,
                        qty: 1,
                    },
                ],
            },
        }
    );
}


/* =========================
   CONFIRM ORDER
========================= */

export async function confirmCmlOrder(
    orderId: number
) {
    return cmlRequest(
        "/order/confirm",
        {
            order_id: orderId,
        }
    );
}


/* =========================
   GET ORDER
========================= */

export async function getCmlOrder(
    orderCode: string
) {
    return cmlRequest(
        "/order/get",
        {
            order_code: orderCode,
        }
    );
}


/* =========================
   RECORD PAYMENT
========================= */

interface RecordCmlPaymentParams {
    orderCode: string;
    providerTransactionId: string;
    amount: number;
    paymentMethod?: string;
    externalReference?: string;
}

export async function recordCmlPayment({
                                           orderCode,
                                           providerTransactionId,
                                           amount,
                                           paymentMethod,
                                           externalReference,
                                       }: RecordCmlPaymentParams) {

    return cmlRequest(
        "/order/payment",
        {
            payment: {
                order_code: orderCode,

                provider: "nowpayments",

                provider_txn_id:
                providerTransactionId,

                amount,

                // CML:
                // 1 = captured
                status: 1,

                ...(paymentMethod
                    ? {
                        payment_method:
                        paymentMethod,
                    }
                    : {}),

                ...(externalReference
                    ? {
                        external_reference:
                        externalReference,
                    }
                    : {}),
            },
        }
    );
}