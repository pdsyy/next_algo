import crypto from "crypto";
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    confirmCmlOrder,
    createCmlCustomer,
    createCmlOrder,
    getCmlOrder,
    getCmlProductByCode,
    resolveCmlCustomer,
    verifyCmlCustomer,
} from "@/lib/cml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const CML_PRODUCT_CODES = {
    "terra-ea": {
        en: "terra-ea",
        ru: "terra-ea-ru",
    },

    "aero-ea": {
        en: "aero-ea",
        ru: "aero-ea-ru",
    },

    "hydro-ea": {
        en: "hydro-ea",
        ru: "hydro-ea-ru",
    },
} as const;


type DeliveryLanguage = "en" | "ru";

type BaseProductCode =
    keyof typeof CML_PRODUCT_CODES;

type RequestedItem = {
    productCode?: unknown;
    quantity?: unknown;
};


const ALLOWED_PRODUCT_CODES =
    new Set<string>(
        Object.keys(CML_PRODUCT_CODES)
    );


/* =========================
   RESPONSE HELPERS
========================= */

function jsonError(
    error: string,
    status = 400
) {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        {
            status,
        }
    );
}


function getErrorMessage(
    error: unknown
) {
    return error instanceof Error
        ? error.message
        : "Unknown checkout error";
}


function extractResponsePayload(
    response: any
) {
    if (
        response?.success?.data &&
        typeof response.success.data === "object"
    ) {
        return response.success.data;
    }

    if (
        response?.success &&
        typeof response.success === "object"
    ) {
        return response.success;
    }

    if (
        response?.data &&
        typeof response.data === "object"
    ) {
        return response.data;
    }

    return response;
}


function extractVerificationRef(
    response: any
): string {
    const payload =
        extractResponsePayload(response);

    const value =
        payload?.verification_ref ??
        payload?.verificationRef ??
        payload?.verification?.ref ??
        "";

    return typeof value === "string"
        ? value.trim()
        : "";
}


function extractVerificationRequired(
    response: any
): boolean {
    const payload =
        extractResponsePayload(response);

    const value =
        payload?.verification_required ??
        payload?.verificationRequired;

    return (
        value === true ||
        value === 1 ||
        value === "true"
    );
}


const extractCustomerId = (
    response: any
) =>
    response?.success?.data?.customer?.id ??
    response?.success?.customer?.id ??
    response?.data?.customer?.id ??
    response?.customer?.id;


const extractOrder = (
    response: any
) =>
    response?.success?.data?.order ??
    response?.success?.order ??
    response?.data?.order ??
    response?.order;


const amountOf = (
    value: unknown
) =>
    Number.parseFloat(
        String(value ?? "")
            .replace(/[^\d.-]/g, "")
    );


/* =========================
   VALIDATION
========================= */

function normalizeEmail(
    value: unknown
) {
    return typeof value === "string"
        ? value.trim().toLowerCase()
        : "";
}


function isValidEmail(
    email: string
) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}


function normalizeItems(
    value: unknown
): BaseProductCode[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const uniqueCodes =
        new Set<BaseProductCode>();

    for (
        const candidate of value as RequestedItem[]
        ) {
        const productCode =
            typeof candidate?.productCode === "string"
                ? candidate.productCode
                    .trim()
                    .toLowerCase()
                : "";

        if (
            !ALLOWED_PRODUCT_CODES.has(
                productCode
            )
        ) {
            throw new Error(
                `Unsupported product code: ${
                    productCode || "empty"
                }`
            );
        }

        if (
            candidate.quantity !== undefined &&
            Number(candidate.quantity) !== 1
        ) {
            throw new Error(
                `Only one copy of ${productCode} can be purchased`
            );
        }

        uniqueCodes.add(
            productCode as BaseProductCode
        );
    }

    return [...uniqueCodes];
}


function createCheckoutReference(
    value: unknown
) {
    if (typeof value !== "string") {
        return `checkout_${crypto.randomUUID()}`;
    }

    const normalized =
        value.trim();

    if (!normalized) {
        return `checkout_${crypto.randomUUID()}`;
    }

    if (
        normalized.length > 128 ||
        !/^[a-zA-Z0-9_-]+$/.test(normalized)
    ) {
        throw new Error(
            "Invalid checkout reference"
        );
    }

    return normalized;
}


/* =========================
   RESOLVE CUSTOMER
========================= */

async function handleResolveCustomer(
    body: any
) {
    const email =
        normalizeEmail(body.email);

    if (!isValidEmail(email)) {
        return jsonError(
            "A valid email address is required"
        );
    }

    try {
        const cmlResponse =
            await resolveCmlCustomer(email);

        const verificationRequired =
            extractVerificationRequired(
                cmlResponse
            );

        const verificationRef =
            extractVerificationRef(
                cmlResponse
            );

        if (
            verificationRequired &&
            !verificationRef
        ) {
            throw new Error(
                "CML did not return a verification reference"
            );
        }

        return NextResponse.json({
            success: true,

            verificationRequired,

            existingCustomer:
            verificationRequired,

            ...(verificationRequired
                ? {
                    verificationRef,
                }
                : {}),
        });
    } catch (error) {
        console.error(
            "CML CUSTOMER RESOLVE ERROR:",
            error
        );

        return jsonError(
            getErrorMessage(error),
            400
        );
    }
}


/* =========================
   VERIFY CUSTOMER OTP
========================= */

async function handleVerifyCustomer(
    body: any
) {
    const verificationRef =
        typeof body.verificationRef === "string"
            ? body.verificationRef.trim()
            : "";

    const otp =
        typeof body.otp === "string"
            ? body.otp.trim()
            : "";

    if (!verificationRef) {
        return jsonError(
            "Verification reference is required"
        );
    }

    if (!otp) {
        return jsonError(
            "Verification code is required"
        );
    }

    try {
        const cmlResponse =
            await verifyCmlCustomer({
                verificationRef,
                otp,
            });

        const verifiedReference =
            extractVerificationRef(
                cmlResponse
            ) || verificationRef;

        return NextResponse.json({
            success: true,
            verified: true,
            existingCustomer: true,
            verificationRef:
            verifiedReference,
        });
    } catch (error) {
        console.error(
            "CML CUSTOMER VERIFY ERROR:",
            error
        );

        return jsonError(
            getErrorMessage(error),
            400
        );
    }
}


/* =========================
   CREATE ORDER
========================= */

async function handleCreateOrder(
    body: any
) {
    const requestedDeliveryLanguage =
        typeof body.deliveryLanguage === "string"
            ? body.deliveryLanguage
                .trim()
                .toLowerCase()
            : "en";

    if (
        requestedDeliveryLanguage !== "en" &&
        requestedDeliveryLanguage !== "ru"
    ) {
        return jsonError(
            "deliveryLanguage must be en or ru"
        );
    }

    const deliveryLanguage:
        DeliveryLanguage =
        requestedDeliveryLanguage;

    const referralCode =
        typeof body.referralCode === "string"
            ? body.referralCode.trim()
            : "";

    const email =
        normalizeEmail(body.email);

    const firstName =
        typeof body.firstName === "string"
            ? body.firstName.trim()
            : "";

    const lastName =
        typeof body.lastName === "string"
            ? body.lastName.trim()
            : "";

    const countryCode =
        typeof body.countryCode === "string"
            ? body.countryCode
                .trim()
                .toUpperCase()
            : "";

    const verificationRef =
        typeof body.verificationRef === "string"
            ? body.verificationRef.trim()
            : "";

    const existingCustomer =
        body.existingCustomer === true ||
        Boolean(verificationRef);

    const checkoutReference =
        createCheckoutReference(
            body.checkoutReference
        );

    const requestedItems =
        Array.isArray(body.items)
            ? body.items
            : body.productCode
                ? [
                    {
                        productCode:
                        body.productCode,

                        quantity:
                            body.quantity ?? 1,
                    },
                ]
                : [];

    const productCodes =
        normalizeItems(requestedItems);

    if (
        !email ||
        !firstName ||
        !lastName ||
        productCodes.length === 0
    ) {
        return jsonError(
            "email, firstName, lastName and at least one item are required"
        );
    }

    if (!isValidEmail(email)) {
        return jsonError(
            "A valid email address is required"
        );
    }

    if (
        countryCode &&
        !/^[A-Z]{2}$/.test(countryCode)
    ) {
        return jsonError(
            "countryCode must contain two letters"
        );
    }

    if (
        existingCustomer &&
        !verificationRef
    ) {
        return jsonError(
            "Email verification is required for this customer",
            409
        );
    }


    const products =
        await Promise.all(
            productCodes.map(
                async productCode => {
                    const cmlProductCode =
                        CML_PRODUCT_CODES[
                            productCode
                            ][deliveryLanguage];

                    try {
                        const product =
                            await getCmlProductByCode(
                                cmlProductCode
                            );

                        const productId =
                            Number(
                                product?.product?.id ??
                                product?.id
                            );

                        if (
                            !Number.isInteger(
                                productId
                            ) ||
                            productId < 1
                        ) {
                            throw new Error(
                                "product ID not returned"
                            );
                        }

                        const productCurrency =
                            String(
                                product?.product
                                    ?.currency ??
                                product?.currency ??
                                ""
                            ).toUpperCase();

                        if (
                            productCurrency !== "USD"
                        ) {
                            throw new Error(
                                `unexpected currency ${productCurrency}`
                            );
                        }

                        return {
                            productCode,
                            cmlProductCode,
                            productId,
                            product,
                        };
                    } catch (error) {
                        const message =
                            getErrorMessage(
                                error
                            );

                        throw new Error(
                            `CML product ${cmlProductCode} is unavailable: ${message}`
                        );
                    }
                }
            )
        );


    const customerResponse =
        await createCmlCustomer({
            email,
            firstName,
            lastName,

            countryCode:
                countryCode || undefined,

            verificationRef:
                verificationRef || undefined,
        });

    const customerId =
        Number(
            extractCustomerId(
                customerResponse
            )
        );

    if (
        !Number.isInteger(customerId) ||
        customerId < 1
    ) {
        throw new Error(
            "CML customer ID not returned"
        );
    }


    const orderResponse =
        await createCmlOrder({
            customerId,

            referralCode:
                referralCode || undefined,

            verificationRef:
                verificationRef || undefined,

            existingCustomer,

            checkoutReference,

            items: products.map(
                ({ productId }) => ({
                    productId,
                    quantity: 1,
                })
            ),
        });

    const created =
        extractOrder(orderResponse);

    const orderId =
        Number(created?.id);

    const orderCode =
        String(
            created?.code ?? ""
        ).trim();

    if (
        !Number.isInteger(orderId) ||
        orderId < 1 ||
        !orderCode
    ) {
        throw new Error(
            "CML order was not created correctly"
        );
    }


    await confirmCmlOrder(orderId);

    const confirmed =
        extractOrder(
            await getCmlOrder(
                orderCode
            )
        );

    if (!confirmed) {
        throw new Error(
            "Confirmed CML order not returned"
        );
    }


    const amount =
        amountOf(
            confirmed.final_amount ??
            confirmed.total ??
            confirmed.amount
        );

    const currency =
        String(
            confirmed.currency ??
            products[0]?.product
                ?.product?.currency ??
            products[0]?.product
                ?.currency ??
            ""
        ).toUpperCase();

    const status =
        Number(confirmed.status);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new Error(
            "Invalid CML order amount"
        );
    }

    if (currency !== "USD") {
        throw new Error(
            `Unexpected CML currency: ${currency}`
        );
    }

    if (status !== 1) {
        throw new Error(
            `CML order is not awaiting payment. Status: ${status}`
        );
    }


    return NextResponse.json({
        success: true,

        order: {
            id: orderId,
            code: orderCode,
            status,
            amount,
            currency,
            deliveryLanguage,
            checkoutReference,

            items: products.map(
                ({
                     productCode,
                     cmlProductCode,
                     productId,
                     product,
                 }) => ({
                    id: productId,

                    code:
                        product.product?.code ??
                        product.code ??
                        cmlProductCode,

                    baseCode:
                    productCode,

                    title:
                        product.product?.title ??
                        product.title,

                    quantity: 1,
                })
            ),
        },
    });
}


/* =========================
   POST
========================= */

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const action =
            typeof body.action === "string"
                ? body.action
                    .trim()
                    .toLowerCase()
                : "create-order";

        if (
            action === "resolve-customer"
        ) {
            return handleResolveCustomer(
                body
            );
        }

        if (
            action === "verify-customer"
        ) {
            return handleVerifyCustomer(
                body
            );
        }

        if (
            action !== "create-order"
        ) {
            return jsonError(
                `Unsupported checkout action: ${action}`
            );
        }

        return await handleCreateOrder(
            body
        );
    } catch (error) {
        console.error(
            "CHECKOUT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    getErrorMessage(error),
            },
            {
                status: 500,
            }
        );
    }
}