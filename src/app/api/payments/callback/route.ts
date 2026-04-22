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
    console.log("[Paymob Callback] req.url:", req.url);
    const url = new URL(req.url);
    const success = url.searchParams.get("success") === "true";
    const appointmentId = url.searchParams.get("merchant_order_id") || url.searchParams.get("order");
    const transactionId = url.searchParams.get("id");

    console.log("[Paymob Callback] params:", { success, appointmentId, transactionId });

    if (appointmentId) {
      try {
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
            console.log("[Paymob Callback] Appointment updated to paid:", appointmentId);
          } else if (!success && appointmentSnap.data()?.paymentStatus !== "paid") {
            await appointmentRef.update({
              paymentStatus: "failed",
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        } else {
          console.log("[Paymob Callback] Appointment not found:", appointmentId);
        }
      } catch (dbError) {
        console.error("[Paymob Callback] Firestore error:", dbError);
        // Continue to redirect even if DB update fails
      }
    }

    // Build redirect URL to break out of Paymob iframe
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const fallbackUrl = `${protocol}://${host}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || fallbackUrl;

    console.log("[Paymob Callback] baseUrl:", baseUrl);

    const redirectUrl = success && appointmentId
      ? `${baseUrl}/patient/payment-success?appointmentId=${appointmentId}&transactionId=${transactionId || 'N/A'}`
      : `${baseUrl}/patient/appointments?payment=failed`;

    // Return HTML that breaks out of iframe and redirects parent page
    const html = `
      <html>
        <head><title>Payment Complete</title></head>
        <body>
          <script>
            try {
              // Try to redirect the entire page (break out of iframe)
              if (window.top && window.top !== window) {
                window.top.location.href = '${redirectUrl}';
              } else {
                window.location.href = '${redirectUrl}';
              }
            } catch (e) {
              // Fallback: try postMessage if cross-origin prevents top redirect
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'PAYMOB_PAYMENT_COMPLETE',
                  success: ${success},
                  appointmentId: '${appointmentId || ''}',
                  transactionId: '${transactionId || ''}'
                }, '*');
              }
              // Show message in case redirect doesn't work
              document.body.innerHTML = '<div style="font-family:sans-serif;text-align:center;margin-top:50px;"><h2>${success ? 'Payment Successful' : 'Payment Failed'}</h2><p>Redirecting...</p><p>If not redirected, <a href="${redirectUrl}">click here</a>.</p></div>';
              // Try redirect again after a short delay
              setTimeout(function() {
                window.location.href = '${redirectUrl}';
              }, 2000);
            }
          </script>
          <div style="font-family:sans-serif;text-align:center;margin-top:50px;">
            <h2>${success ? 'Payment Successful' : 'Payment Failed'}</h2>
            <p>Please wait while we redirect you...</p>
            <a href="${redirectUrl}">Click here if you are not redirected</a>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: unknown) {
    console.error("Paymob GET callback error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error stack:", (error as Error)?.stack);
    return new Response(`Error processing callback: ${errMsg}`, { status: 500 });
  }
}
