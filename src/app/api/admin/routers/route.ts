import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET() {
  const { data, error } = await createAdminClient().from("routers").select("id,name,location,router_os,service_type,status,public_ip,api_port,wireguard_enabled,last_seen_at,last_error,created_at,updated_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load routers." }, { status: 500 });
  return NextResponse.json({ routers: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { name?: string; location?: string; routerOs?: string; serviceType?: string } | null;
  const name = body?.name?.trim();
  if (!name || name.length < 3 || name.length > 64) return NextResponse.json({ error: "Router name must be between 3 and 64 characters." }, { status: 400 });
  const routerOs = body?.routerOs ?? "";
  const serviceType = body?.serviceType ?? "";
  if (!['routeros7', 'routeros6', 'upload'].includes(routerOs)) return NextResponse.json({ error: "Choose a supported RouterOS setup path." }, { status: 400 });
  if (!['hotspot', 'pppoe'].includes(serviceType)) return NextResponse.json({ error: "Choose a service type." }, { status: 400 });

  const token = randomBytes(32).toString("base64url");
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("routers").insert({ name, location: body?.location?.trim() || null, router_os: routerOs, service_type: serviceType, setup_token_hash: hashToken(token), status: "pending" }).select("id,name,location,router_os,service_type,status,created_at").single();
  if (error) return NextResponse.json({ error: "Unable to create router setup." }, { status: 500 });
  return NextResponse.json({ router: data, setupToken: token });
}
