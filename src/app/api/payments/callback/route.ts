import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Collections } from "@/constants/collections";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { obj: transaction } = body;

    if (!transaction) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const appointmentId = transaction.order?.merchant_order_id;
    const success = transaction.success;
    const transactionId = transaction.id;

    if (!appointmentId) {
      return NextResponse.json({ error: "merchant_order_id missing" }, { status: 400 });
    }

    const appointmentRef = adminDb.collection(Collections.APPOINTMENTS).doc(appointmentId);
    const appointmentSnap = await appointmentRef.get();

    if (success && appointmentSnap.exists) {
      await appointmentRef.update({
        paymentStatus: "paid",
        status: "pending_approval",
        paymentId: String(transactionId),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (!success && appointmentSnap.exists && appointmentSnap.data()?.paymentStatus !== "paid") {
      await appointmentRef.update({
        paymentStatus: "failed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Paymob POST callback error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const success = url.searchParams.get("success") === "true";
    const appointmentId = url.searchParams.get("merchant_order_id") || url.searchParams.get("order");
    const transactionId = url.searchParams.get("id");

    if (appointmentId) {
      const appointmentRef = adminDb.collection(Collections.APPOINTMENTS).doc(appointmentId);
      const appointmentSnap = await appointmentRef.get();

      if (appointmentSnap.exists) {
        if (success) {
          await appointmentRef.update({
            paymentStatus: "paid",
            status: "pending_approval",
            paymentId: String(transactionId),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else if (!success && appointmentSnap.data()?.paymentStatus !== "paid") {
          await appointmentRef.update({
            paymentStatus: "failed",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // Since this GET request typically happens inside the Paymob iframe when the user clicks 'Return to merchant'
    // or finishes the 3D secure process, we want to close the iframe or tell the parent window it's done.
    const html = `
      <html>
        <head><title>Payment Complete</title></head>
        <body>
          <script>
            // Try to notify the parent window that payment is complete
            if (window.parent !== window) {
              window.parent.postMessage({ type: 'PAYMOB_PAYMENT_COMPLETE', success: ${success} }, '*');
            } else {
              window.location.href = '/patient/appointments';
            }
          </script>
          <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h2>${success ? 'Payment Successful' : 'Payment Failed'}</h2>
            <p>You can close this window now or return to your appointments.</p>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: unknown) {
    console.error("Paymob GET callback error:", error);
    return new Response("Error processing callback", { status: 500 });
  }
}
