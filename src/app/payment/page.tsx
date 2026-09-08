"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./paymentStyle.css";

const PAYMENT_KEY = "currentPayment";
const CHECKOUT_KEY = "algo_world_checkout_v1";
const SUCCESS_KEY = "algo_world_payment_success_v1";
const FINAL = new Set(["finished", "failed", "expired", "refunded"]);

type Payment = { id:string; status:string; payAddress:string; payAmount:number; payCurrency:string; priceAmount:number; priceCurrency:string; orderCode?:string };
type Item = { id:string; name:string; subtitle?:string; imageSrc?:string; unitPrice:number; quantity:number };
type Checkout = { items:Item[]; currency:string; subtotal:number; discount:number; total:number; savedAt:number };

export default function PaymentPage() {
    const [payment,setPayment]=useState<Payment|null>(null);
    const [checkout,setCheckout]=useState<Checkout|null>(null);
    const [loaded,setLoaded]=useState(false);
    const [copied,setCopied]=useState(false);
    const redirected=useRef(false);

    useEffect(()=>{
        try {
            const p=sessionStorage.getItem(PAYMENT_KEY);
            const c=localStorage.getItem(CHECKOUT_KEY);
            if(p) setPayment(JSON.parse(p));
            if(c) setCheckout(JSON.parse(c));
        } catch(error){ console.error("PAYMENT STORAGE ERROR:",error); }
        finally{ setLoaded(true); }
    },[]);

    useEffect(()=>{
        if(!payment?.id || FINAL.has(payment.status)) return;
        let stopped=false;
        const check=async()=>{
            try{
                const response=await fetch(`/api/payments/nowpayments/status?paymentId=${encodeURIComponent(payment.id)}`,{cache:"no-store"});
                const data=await response.json();
                if(!response.ok) throw new Error(data.error || "Unable to check payment status");
                if(stopped || typeof data.payment_status!=="string") return;
                setPayment(previous=>{
                    if(!previous) return previous;
                    const next={...previous,status:data.payment_status};
                    sessionStorage.setItem(PAYMENT_KEY,JSON.stringify(next));
                    return next;
                });
            }catch(error){ console.error("STATUS ERROR:",error); }
        };
        void check();
        const timer=window.setInterval(check,5000);
        return()=>{stopped=true;window.clearInterval(timer)};
    },[payment?.id,payment?.status]);

    useEffect(()=>{
        if(payment?.status!=="finished" || redirected.current) return;
        redirected.current=true;
        const successItems=checkout?.items ?? [];
        sessionStorage.setItem(SUCCESS_KEY,JSON.stringify({
            orderCode:payment.orderCode || "",
            productNames:successItems.map(item=>item.name),
            imageSrc:successItems[0]?.imageSrc,
            completedAt:Date.now(),
        }));
        window.location.replace("/?payment=success");
    },[payment?.status,payment?.orderCode,checkout]);

    const formatter=useMemo(()=>new Intl.NumberFormat("en-US",{style:"currency",currency:(checkout?.currency||payment?.priceCurrency||"USD").toUpperCase()}),[checkout?.currency,payment?.priceCurrency]);
    const copy=async()=>{if(!payment)return;await navigator.clipboard.writeText(payment.payAddress);setCopied(true);window.setTimeout(()=>setCopied(false),1500)};

    if(!loaded) return <main className="payment_page">Loading…</main>;
    if(!payment) return <main className="payment_page">Payment not found</main>;

    return <main className="payment_page"><div className="payment_page_container">
        <section className="payment_card">
            <h1>Complete payment</h1>
            {payment.orderCode&&<div className="payment_order_number">Order #{payment.orderCode}</div>}
            <div>{formatter.format(payment.priceAmount)}</div><p>Send exactly</p>
            <strong>{payment.payAmount} {payment.payCurrency.toUpperCase()}</strong>
            <div className="payment_qr"><QRCodeSVG value={payment.payAddress} size={200}/></div>
            <div className="payment_address">{payment.payAddress}</div>
            <button type="button" onClick={copy}>{copied?"COPIED":"COPY ADDRESS"}</button>
            <div>Status: {payment.status}</div>
        </section>
        {checkout&&<aside className="checkout_summary">
            <div className="checkout_summary_head"><h2>Order summary</h2><div>{formatter.format(checkout.total)}</div></div>
            <div className="checkout_summary_label">ORDER SUMMARY</div>
            <ul className="checkout_items">{checkout.items.map(item=><li key={item.id} className="checkout_item">
                <div className="checkout_item_image">{item.imageSrc?<img src={item.imageSrc} alt=""/>:<div className="checkout_image_placeholder"/>}</div>
                <div className="checkout_item_info"><strong>{item.name}</strong>{item.subtitle&&<span>{item.subtitle}</span>}</div>
                <div className="checkout_item_price">{formatter.format(item.unitPrice)}</div>
            </li>)}</ul>
            <div className="checkout_totals"><div><span>Subtotal</span><span>{formatter.format(checkout.subtotal)}</span></div><div><span>Discount</span><span>{formatter.format(checkout.discount)}</span></div><div className="checkout_total"><span>Total</span><strong>{formatter.format(checkout.total)}</strong></div></div>
        </aside>}
    </div></main>;
}