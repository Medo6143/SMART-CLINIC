import { NextResponse } from "next/server";
import { PaymobClient } from "@/lib/payments/paymob";

const paymob = new PaymobClient(process.env.PAYMOB_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { appointmentId, amount, billingData } = await req.json();

    if (!appointmentId || !amount || !billingData) {
      return NextResponse.json(
        { error: "appointmentId, amount, and billingData are required" },
        { status: 400 }
      );
    }

    // 1. Authenticate with Paymob
    const token = await paymob.authenticate();

    // 2. Create Order
    const orderId = await paymob.createOrder(token, amount, appointmentId);

    // 3. Generate Payment Key
    const paymentToken = await paymob.generatePaymentKey(
      token,
      orderId,
      amount,
      process.env.PAYMOB_INTEGRATION_ID || "",
      billingData
    );

    return NextResponse.json({ paymentToken });
  } catch (error: any) {
    console.error("Payment initiation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
