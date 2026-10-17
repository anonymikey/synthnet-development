import { NextResponse } from "next/server";
import { authorizeHardware, recordActiveSession } from "@/lib/hardware-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkoutRequestId = String(
    body?.checkout_request_id ?? body?.checkoutRequestId ?? body?.mpesa_checkout_id ?? "",
  ).trim();
  const resultCode = Number(body?.result_code ?? body?.resultCode ?? body?.status_code);

  if (!checkoutRequestId) {
    return NextResponse.json({ error: "checkout_request_id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select(
      "id, client_mac, ap_mac, gateway_type, package_id, packages(duration_minutes, speed_limit_down_mbps, speed_limit_up_mbps)",
    )
    .eq("mpesa_checkout_id", checkoutRequestId)
    .maybeSingle();

  if (transactionError) {
    return NextResponse.json({ error: "Could not load transaction" }, { status: 500 });
  }
  if (!transaction) return NextResponse.json({ received: true, matched: false });

  if (resultCode !== 0) {
    await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
    return NextResponse.json({ received: true, status: "failed" });
  }

  const { data: existingSession } = await supabase
    .from("active_sessions")
    .select("id")
    .eq("transaction_id", transaction.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingSession) return NextResponse.json({ received: true, status: "completed", duplicate: true });

  try {
    await authorizeHardware(transaction, {
      mac: String(body?.mac ?? body?.clientMac ?? body?.client_mac ?? "").trim() || undefined,
      ip: String(body?.ip ?? "").trim() || undefined,
      username: String(body?.username ?? "").trim() || undefined,
    });

    const packageRow = Array.isArray(transaction.packages)
      ? transaction.packages[0]
      : transaction.packages;
    const durationMinutes = packageRow?.duration_minutes;
    if (!durationMinutes) throw new Error("Transaction package duration is unavailable.");

    const expiresAt = new Date(Date.now() + durationMinutes * 60_000);
    await recordActiveSession(transaction, expiresAt);
    await supabase.from("transactions").update({ status: "completed" }).eq("id", transaction.id);

    return NextResponse.json({
      received: true,
      status: "completed",
      gateway: transaction.gateway_type,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hardware authorization failed" },
      { status: 502 },
    );
  }
}
