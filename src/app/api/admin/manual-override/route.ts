import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const clientMac = String(body?.clientMac ?? "").trim().slice(0, 64);
  const username = String(body?.username ?? "").trim().slice(0, 128) || null;
  const packageId = String(body?.packageId ?? "").trim();
  const gatewayType = body?.gatewayType === "omada" ? "omada" : "mikrotik";
  const apMac = String(body?.apMac ?? "").trim().slice(0, 64) || null;
  if (!clientMac || !packageId) return NextResponse.json({ error: "MAC address and package are required." }, { status: 400 });

  const supabase = createAdminClient();
  const { data: pkg, error: packageError } = await supabase.from("packages").select("id,name,price,duration_minutes,speed_limit_down_mbps,speed_limit_up_mbps").eq("id", packageId).maybeSingle();
  if (packageError || !pkg) return NextResponse.json({ error: "Selected package was not found." }, { status: 400 });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + pkg.duration_minutes * 60_000);
  const { data: transaction, error: transactionError } = await supabase.from("transactions").insert({ phone_number: username ?? "MANUAL-OVERRIDE", amount: pkg.price, client_mac: clientMac, ap_mac: apMac, status: "completed", gateway_type: gatewayType, package_id: pkg.id, callback_metadata: { source: "manual_override", username, authorizedAt: now.toISOString() } }).select("id").single();
  if (transactionError || !transaction) return NextResponse.json({ error: "Unable to record manual adjustment." }, { status: 500 });
  const { error: sessionError } = await supabase.from("active_sessions").insert({ client_mac: clientMac, ap_mac: apMac, gateway_type: gatewayType, session_start: now.toISOString(), session_end: expiresAt.toISOString(), status: "active", transaction_id: transaction.id });
  if (sessionError) return NextResponse.json({ error: "Payment logged, but lease activation failed." }, { status: 500 });
  return NextResponse.json({ transactionId: transaction.id, expiresAt: expiresAt.toISOString(), package: pkg });
}
