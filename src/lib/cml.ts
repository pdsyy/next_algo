import crypto from "crypto";

const CML_API_URL =
    "https://vwqretlvkrravzguxydw.functions.eu-west-2.nhost.run/v1";

const CML_CHANNEL = "algo-bots";

/* =========================
   HEADERS
========================= */

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
    payload: Record<string, unknown>,
): Promise<T> {
    const body = JSON.stringify(payload);

    const response = await fetch(
        `${CML_API_URL}${endpoint}`,
        {
            method: "POST",
            headers: createCmlHeaders(body),
            body,
            cache: "no-store",
        },
    );

    const responseText = await response.text();

    let data: any;

    try {
        data = JSON.parse(responseText);
    } catch {
        data = responseText;
    }

    if (!response.ok) {
        console.error(
            `CML ERROR ${endpoint}:`,
            response.status,
            data,
        );

        const message =
            data?.error?.message ??
            data?.message ??
            responseText ??
            `CML request failed: ${response.status}`;

        throw new Error(message);
    }

    return data;
}

/* =========================
   CATALOG
========================= */

export async function getCmlProducts(
    countryCode?: string,
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
        },
    );
}

/* =========================
   FIND PRODUCT
========================= */

export async function getCmlProductByCode(
    productCode: string,
) {
    const normalizedProductCode =
        productCode.trim();

    if (!normalizedProductCode) {
        throw new Error(
            "CML product code is required",
        );
    }

    const catalog =
        await getCmlProducts();

    const data =
        catalog?.success;

    if (!data?.available) {
        throw new Error(
            "CML catalog is not available",
        );
    }

    const products =
        Array.isArray(data.products)
            ? data.products
            : [];

    const product =
        products.find(
            (item: any) =>
                String(item.code) ===
                normalizedProductCode ||
                String(item.product?.code) ===
                normalizedProductCode,
        );

    if (!product) {
        throw new Error(
            `CML product "${normalizedProductCode}" not found`,
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
                email: email.trim().toLowerCase(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                type: "Individual",

                ...(countryCode
                    ? {
                        country_code:
                            countryCode.toUpperCase(),
                    }
                    : {}),
            },
        },
    );
}

/* =========================
   CREATE ORDER
========================= */

interface CreateOrderParams {
    customerId: number;
    productId: number;
    quantity: number;
}

export async function createCmlOrder({
                                         customerId,
                                         productId,
                                         quantity,
                                     }: CreateOrderParams) {
    if (
        !Number.isInteger(customerId) ||
        customerId <= 0
    ) {
        throw new Error(
            "Invalid CML customer ID",
        );
    }

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error(
            "Invalid CML product ID",
        );
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
    ) {
        throw new Error(
            "Invalid product quantity",
        );
    }

    return cmlRequest(
        "/order/submit",
        {
            order: {
                customer_id: customerId,
                sales_channel: CML_CHANNEL,

                items: [
                    {
                        product_id: productId,
                        qty: quantity,
                    },
                ],
            },
        },
    );
}

/* =========================
   CONFIRM ORDER
========================= */

export async function confirmCmlOrder(
    orderId: number,
) {
    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        throw new Error(
            "Invalid CML order ID",
        );
    }

    return cmlRequest(
        "/order/confirm",
        {
            order_id: orderId,
        },
    );
}

/* =========================
   GET ORDER
========================= */

export async function getCmlOrder(
    orderCode: string,
) {
    const normalizedOrderCode =
        orderCode.trim();

    if (!normalizedOrderCode) {
        throw new Error(
            "CML order code is required",
        );
    }

    return cmlRequest(
        "/order/get",
        {
            order_code: normalizedOrderCode,
        },
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
    if (!orderCode.trim()) {
        throw new Error(
            "CML order code is required",
        );
    }

    if (!providerTransactionId.trim()) {
        throw new Error(
            "Provider transaction ID is required",
        );
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new Error(
            "Invalid payment amount",
        );
    }

    return cmlRequest(
        "/order/payment",
        {
            payment: {
                order_code: orderCode.trim(),

                provider: "nowpayments",

                provider_txn_id:
                    providerTransactionId.trim(),

                amount,

                // CML: 1 = captured
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
        },
    );
}