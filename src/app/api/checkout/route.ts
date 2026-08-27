import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getCmlProductByCode,
    createCmlCustomer,
    createCmlOrder,
    confirmCmlOrder,
    getCmlOrder,
} from "@/lib/cml";


export async function POST(
    req: NextRequest
) {
    try {
        const body = await req.json();

        const {
            email,
            firstName,
            lastName,
            productCode,
        } = body;


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
                }
            );
        }


        /* =========================
           1. FIND PRODUCT IN CML
        ========================= */

        const product =
            await getCmlProductByCode(
                productCode
            );

        console.log(
            "CML PRODUCT:",
            JSON.stringify(
                product,
                null,
                2
            )
        );


        if (!product?.id) {
            throw new Error(
                "CML product ID not found"
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
                2
            )
        );


        /*
         * CML может оборачивать customer
         * немного по-разному.
         * Поэтому проверяем несколько вариантов.
         */

        const customerId =
            customerResponse?.success?.data
                ?.customer?.id ??
            customerResponse?.success
                ?.customer?.id ??
            customerResponse?.data
                ?.customer?.id ??
            customerResponse?.customer?.id;


        if (!customerId) {
            console.error(
                "CUSTOMER ID NOT FOUND:",
                customerResponse
            );

            throw new Error(
                "CML customer ID not returned"
            );
        }


        /* =========================
           3. CREATE DRAFT ORDER
        ========================= */

        const orderResponse =
            await createCmlOrder({
                customerId:
                    Number(customerId),

                productId:
                    Number(product.id),
            });


        console.log(
            "CML ORDER CREATED:",
            JSON.stringify(
                orderResponse,
                null,
                2
            )
        );


        /*
         * Возможные структуры ответа:
         *
         * {
         *   success: true,
         *   data: {
         *      order: {...}
         *   }
         * }
         *
         * либо
         *
         * {
         *   success: {
         *      data: {
         *          order: {...}
         *      }
         *   }
         * }
         */

        const order =
            orderResponse?.data?.order ??
            orderResponse?.success?.data
                ?.order ??
            orderResponse?.success?.order ??
            orderResponse?.order;


        if (
            !order?.id ||
            !order?.code
        ) {
            console.error(
                "ORDER DATA NOT FOUND:",
                orderResponse
            );

            throw new Error(
                "CML order was not created correctly"
            );
        }


        /* =========================
           4. CONFIRM ORDER
        ========================= */

        const confirmResponse =
            await confirmCmlOrder(
                Number(order.id)
            );


        console.log(
            "CML ORDER CONFIRM:",
            JSON.stringify(
                confirmResponse,
                null,
                2
            )
        );


        /* =========================
           5. GET CONFIRMED ORDER
        ========================= */

        const confirmedOrderResponse =
            await getCmlOrder(
                order.code
            );


        console.log(
            "CML CONFIRMED ORDER FULL:",
            JSON.stringify(
                confirmedOrderResponse,
                null,
                2
            )
        );


        /*
         * Основной ожидаемый вариант:
         *
         * {
         *   success: {
         *      order: {...}
         *   }
         * }
         */

        const confirmedOrder =
            confirmedOrderResponse
                ?.success?.order ??
            confirmedOrderResponse
                ?.success?.data?.order ??
            confirmedOrderResponse
                ?.data?.order ??
            confirmedOrderResponse
                ?.order;


        if (!confirmedOrder) {
            console.error(
                "CONFIRMED ORDER NOT FOUND:",
                confirmedOrderResponse
            );

            throw new Error(
                "Confirmed CML order not returned"
            );
        }


        /* =========================
           6. GET AUTHORITATIVE PRICE
        ========================= */

        const rawAmount =
            confirmedOrder.final_amount ??
            confirmedOrder.total ??
            confirmedOrder.amount;


        const normalizedAmount =
            String(rawAmount)
                .replace(/[^\d.-]/g, "");

        const amount =
            parseFloat(normalizedAmount);

        const currency =
            confirmedOrder.currency ??
            product.currency;


        console.log(
            "CML ORDER AMOUNT:",
            {
                rawAmount,
                amount,
                currency,
                status:
                confirmedOrder.status,
            }
        );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new Error(
                `Invalid CML order amount: ${rawAmount}`
            );
        }


        if (!currency) {
            throw new Error(
                "CML order currency not returned"
            );
        }


        /* =========================
           7. RESPONSE
        ========================= */

        return NextResponse.json({
            success: true,

            order: {
                id:
                    Number(order.id),

                code:
                order.code,

                status:
                confirmedOrder.status,

                amount,

                currency,

                product: {
                    id:
                    product.id,

                    code:
                        product.product?.code ??
                        product.code,

                    title:
                        product.product?.title ??
                        product.title,

                    description:
                        product.product
                            ?.description ??
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
            error
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
            }
        );
    }
}