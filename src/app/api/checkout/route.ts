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
} from "@/lib/cml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
    email?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    productCode?: unknown;
    quantity?: unknown;
};

function normalizeAmount(
    value: unknown,
) {
    const normalized =
        String(value ?? "")
            .replace(/[^\d.-]/g, "");

    return Number.parseFloat(normalized);
}

function extractCustomerId(
    response: any,
) {
    return (
        response?.success?.data?.customer?.id ??
        response?.success?.customer?.id ??
        response?.data?.customer?.id ??
        response?.customer?.id
    );
}

function extractOrder(
    response: any,
) {
    return (
        response?.success?.data?.order ??
        response?.success?.order ??
        response?.data?.order ??
        response?.order
    );
}

export async function POST(
    request: NextRequest,
) {
    try {
        const body =
            (await request.json()) as CheckoutBody;

        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";

        const firstName =
            typeof body.firstName === "string"
                ? body.firstName.trim()
                : "";

        const lastName =
            typeof body.lastName === "string"
                ? body.lastName.trim()
                : "";

        const productCode =
            typeof body.productCode === "string"
                ? body.productCode.trim()
                : "";

        const quantity =
            Number(body.quantity ?? 1);

        /* =========================
           VALIDATION
        ========================= */

        if (
            !email ||
            !firstName ||
            !lastName ||
            !productCode
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "email, firstName, lastName and productCode are required",
                },
                {
                    status: 400,
                },
            );
        }

        const emailIsValid =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email,
            );

        if (!emailIsValid) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "A valid email address is required",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 99
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "quantity must be an integer from 1 to 99",
                },
                {
                    status: 400,
                },
            );
        }

        /* =========================
           1. FIND PRODUCT IN CML
        ========================= */

        const product =
            await getCmlProductByCode(
                productCode,
            );

        console.log(
            "CML PRODUCT:",
            JSON.stringify(
                product,
                null,
                2,
            ),
        );

        const productId =
            Number(product?.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            throw new Error(
                "CML product ID not found",
            );
        }

        /* =========================
           2. CREATE CUSTOMER
        ========================= */

        const customerResponse =
            await createCmlCustomer({
                email,
                firstName,
                lastName,
            });

        console.log(
            "CML CUSTOMER RESPONSE:",
            JSON.stringify(
                customerResponse,
                null,
                2,
            ),
        );

        const customerId =
            Number(
                extractCustomerId(
                    customerResponse,
                ),
            );

        if (
            !Number.isInteger(customerId) ||
            customerId <= 0
        ) {
            console.error(
                "CUSTOMER ID NOT FOUND:",
                customerResponse,
            );

            throw new Error(
                "CML customer ID not returned",
            );
        }

        /* =========================
           3. CREATE DRAFT ORDER
        ========================= */

        const orderResponse =
            await createCmlOrder({
                customerId,
                productId,
                quantity,
            });

        console.log(
            "CML ORDER CREATED:",
            JSON.stringify(
                orderResponse,
                null,
                2,
            ),
        );

        const createdOrder =
            extractOrder(orderResponse);

        const orderId =
            Number(createdOrder?.id);

        const orderCode =
            String(
                createdOrder?.code ?? "",
            ).trim();

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0 ||
            !orderCode
        ) {
            console.error(
                "ORDER DATA NOT FOUND:",
                orderResponse,
            );

            throw new Error(
                "CML order was not created correctly",
            );
        }

        /* =========================
           4. CONFIRM ORDER
        ========================= */

        const confirmResponse =
            await confirmCmlOrder(
                orderId,
            );

        console.log(
            "CML ORDER CONFIRM:",
            JSON.stringify(
                confirmResponse,
                null,
                2,
            ),
        );

        /* =========================
           5. GET CONFIRMED ORDER
        ========================= */

        const confirmedOrderResponse =
            await getCmlOrder(
                orderCode,
            );

        console.log(
            "CML CONFIRMED ORDER:",
            JSON.stringify(
                confirmedOrderResponse,
                null,
                2,
            ),
        );

        const confirmedOrder =
            extractOrder(
                confirmedOrderResponse,
            );

        if (!confirmedOrder) {
            throw new Error(
                "Confirmed CML order not returned",
            );
        }

        /* =========================
           6. AUTHORITATIVE PRICE
        ========================= */

        const rawAmount =
            confirmedOrder.final_amount ??
            confirmedOrder.total ??
            confirmedOrder.amount;

        const amount =
            normalizeAmount(rawAmount);

        const currency =
            String(
                confirmedOrder.currency ??
                product.currency ??
                "",
            ).toUpperCase();

        const status =
            Number(
                confirmedOrder.status,
            );

        console.log(
            "CML ORDER AMOUNT:",
            {
                rawAmount,
                amount,
                currency,
                quantity,
                status,
            },
        );

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new Error(
                `Invalid CML order amount: ${rawAmount}`,
            );
        }

        if (!currency) {
            throw new Error(
                "CML order currency not returned",
            );
        }

        if (currency !== "USD") {
            throw new Error(
                `Unexpected CML currency: ${currency}`,
            );
        }

        /*
         * После confirm заказ должен ожидать оплату.
         * В вашей текущей интеграции CML использует статус 1.
         */
        if (status !== 1) {
            throw new Error(
                `CML order is not awaiting payment. Status: ${status}`,
            );
        }

        /* =========================
           7. RESPONSE
        ========================= */

        return NextResponse.json({
            success: true,

            order: {
                id: orderId,
                code: orderCode,
                status,
                amount,
                currency,
                quantity,

                product: {
                    id: productId,

                    code:
                        product.product?.code ??
                        product.code,

                    title:
                        product.product?.title ??
                        product.title,

                    description:
                        product.product?.description ??
                        product.description,

                    programId:
                    product.program_id,

                    programCode:
                    product.program?.code,

                    programName:
                    product.program?.name,
                },
            },
        });
    } catch (error) {
        console.error(
            "CHECKOUT ERROR:",
            error,
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown checkout error",
            },
            {
                status: 500,
            },
        );
    }
}