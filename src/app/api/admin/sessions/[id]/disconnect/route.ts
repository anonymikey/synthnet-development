import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evictHardwareSession } from "@/lib/hardware-authorization";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Session id is required." }, { status: 400 });
  const supabase = createAdminClient();
  const { data: session, error: loadError } = await supabase
    .from("active_sessions")
    .select("id,client_mac,ap_mac,gateway_type,status")
    .eq("id", id)
    .maybeSingle();
  if (loadError) return NextResponse.json({ error: "Unable to load the session." }, { status: 500 });
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "active") return NextResponse.json({ ok: true, status: session.status });
  try {
    await evictHardwareSession(session);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Hardware disconnect failed." }, { status: 502 });
  }
  const { error: updateError } = await supabase
    .from("active_sessions")
    .update({ status: "ended", session_end: new Date().toISOString() })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: "The device was contacted, but the session could not be updated." }, { status: 500 });
  return NextResponse.json({ ok: true, status: "ended" });
}
