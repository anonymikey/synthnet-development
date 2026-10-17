import { NextResponse } from "next/server";
import { evictHardwareSession } from "@/lib/hardware-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

type ExpiredSession = {
  id: string;
  client_mac: string;
  ap_mac: string | null;
  gateway_type: "mikrotik" | "omada";
  session_end: string | null;
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: sessions, error } = await supabase
    .from("active_sessions")
    .select("id,client_mac,ap_mac,gateway_type,session_end")
    .eq("status", "active")
    .not("session_end", "is", null)
    .lt("session_end", new Date().toISOString())
    .limit(100);

  if (error) return NextResponse.json({ error: "Unable to load expired sessions." }, { status: 500 });

  const results = await Promise.allSettled(
    ((sessions ?? []) as ExpiredSession[]).map(async (session) => {
      await evictHardwareSession(session);
      const { error: updateError } = await supabase
        .from("active_sessions")
        .update({ status: "expired" })
        .eq("id", session.id)
        .eq("status", "active");
      if (updateError) throw new Error(`Lease state sync failed: ${updateError.message}`);
      return session.id;
    }),
  );

  const failed = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  return NextResponse.json({
    processed: results.length - failed.length,
    failed: failed.length,
    checked_at: new Date().toISOString(),
  }, { status: failed.length ? 207 : 200 });
}
