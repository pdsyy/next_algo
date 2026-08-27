"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";


const TestButton = () => {

    const router =
        useRouter();

    const [loading, setLoading] =
        useState(false);


    const buyTerra =
        async () => {

            if (loading) return;

            try {

                setLoading(true);


                /* =========================
                   1. CREATE CML ORDER
                ========================= */

                const checkoutResponse =
                    await fetch(
                        "/api/checkout",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    productCode:
                                        "123456",

                                    email:
                                        `test-${Date.now()}@example.com`,

                                    firstName:
                                        "Test",

                                    lastName:
                                        "Customer",
                                }),
                        }
                    );


                const checkout =
                    await checkoutResponse.json();


                console.log(
                    "CHECKOUT:",
                    checkout
                );


                if (
                    !checkoutResponse.ok ||
                    !checkout.success
                ) {
                    throw new Error(
                        checkout.error ||
                        "Checkout failed"
                    );
                }


                const orderCode =
                    checkout.order.code;


                /* =========================
                   2. CREATE NOWPAYMENTS
                ========================= */

                const paymentResponse =
                    await fetch(
                        "/api/payments/nowpayments/create",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body:
                                JSON.stringify({
                                    orderCode,

                                    payCurrency:
                                        "btc",
                                }),
                        }
                    );


                const payment =
                    await paymentResponse.json();


                console.log(
                    "PAYMENT:",
                    payment
                );


                if (
                    !paymentResponse.ok ||
                    !payment.success
                ) {
                    throw new Error(
                        payment.error ||
                        "Payment creation failed"
                    );
                }


                /* =========================
                   3. SAVE PAYMENT
                ========================= */

                sessionStorage.setItem(
                    "currentPayment",

                    JSON.stringify({
                        ...payment.payment,

                        orderCode:
                        payment.order.code,
                    })
                );


                /* =========================
                   4. PAYMENT PAGE
                ========================= */

                router.push(
                    "/payment"
                );


            } catch (error) {

                console.error(
                    "BUY ERROR:",
                    error
                );

                alert(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong"
                );

            } finally {

                setLoading(false);

            }
        };


    return (
        <button
            type="button"
            onClick={buyTerra}
            disabled={loading}
        >
            {
                loading
                    ? "CREATING ORDER..."
                    : "BUY TERRA"
            }
        </button>
    );
};


export default TestButton;