import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkoutRequestId = String(body?.checkoutRequestId ?? "").trim();
  const baseUrl = process.env.COURTNEY_BASE_URL;
  const apiKey = process.env.COURTNEY_API_KEY;
  const apiSecret = process.env.COURTNEY_API_SECRET;

  if (!checkoutRequestId || !baseUrl || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Payment status is unavailable." }, { status: 400 });
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v2/status`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "X-API-Secret": apiSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ checkout_request_id: checkoutRequestId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Payment status check failed." }, { status: 502 });

  const status = data?.status === "completed" ? "completed" : data?.status === "failed" ? "failed" : "pending";
  const supabase = createAdminClient();
  await supabase.from("transactions").update({ status }).eq("mpesa_checkout_id", checkoutRequestId);

  return NextResponse.json({ status, receipt: data?.mpesaReceipt ?? null });
}
