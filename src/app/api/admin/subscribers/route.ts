import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await createAdminClient().from("active_sessions").select("id,client_mac,ap_mac,gateway_type,session_start,session_end,status,transaction_id,transactions(amount,package_id,packages(name))").order("session_start", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: "Unable to load live subscribers." }, { status: 500 });
  return NextResponse.json(data ?? []);
}
