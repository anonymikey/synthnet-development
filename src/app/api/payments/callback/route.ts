import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkoutRequestId = String(body?.checkout_request_id ?? body?.checkoutRequestId ?? "").trim();
  const resultCode = Number(body?.result_code ?? body?.resultCode);
  const status = resultCode === 0 ? "completed" : "failed";

  if (checkoutRequestId) {
    const supabase = createAdminClient();
    await supabase
      .from("transactions")
      .update({ status })
      .eq("mpesa_checkout_id", checkoutRequestId);
  }

  return NextResponse.json({ received: true });
}
