import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: router } = await supabase.from("routers").select("id,service_type").eq("setup_token_hash", hashToken(token)).maybeSingle();
  if (!router) return new NextResponse("# SYNTHNET setup token is invalid or expired.", { status: 404 });
  await supabase.from("routers").update({ status: "online", wireguard_enabled: true, last_seen_at: new Date().toISOString(), last_error: null, setup_token_hash: null, updated_at: new Date().toISOString() }).eq("id", router.id);
  const script = `# SYNTHNET connected successfully\n# Router: ${router.id}\n# Service: ${router.service_type}\n/system identity print\n`;
  return new NextResponse(script, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
