import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAC_ADDRESS = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;
const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export async function GET() {
  const { data, error } = await createAdminClient()
    .from("omada_access_points")
    .select("id,name,ssid,model_code,ip_address,mac_address,status,client_count,band,firmware,last_seen_at,reboot_requested_at,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load Omada access points." }, { status: 500 });
  return NextResponse.json({ accessPoints: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Access point id is required." }, { status: 400 });
  const { error } = await createAdminClient().from("omada_access_points").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to remove access point." }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { name?: string; ssid?: string; modelCode?: string; ipAddress?: string; macAddress?: string } | null;
  const name = body?.name?.trim();
  const ssid = body?.ssid?.trim();
  const macAddress = body?.macAddress?.trim().toUpperCase();
  const ipAddress = body?.ipAddress?.trim() || null;
  if (!name || name.length < 3 || name.length > 64) return NextResponse.json({ error: "Name must be between 3 and 64 characters." }, { status: 400 });
  if (!ssid || ssid.length > 64) return NextResponse.json({ error: "Enter a valid WiFi name." }, { status: 400 });
  if (!macAddress || !MAC_ADDRESS.test(macAddress)) return NextResponse.json({ error: "Enter a valid MAC address." }, { status: 400 });
  if (ipAddress && !IPV4.test(ipAddress)) return NextResponse.json({ error: "Enter a valid IPv4 address." }, { status: 400 });
  const { data, error } = await createAdminClient().from("omada_access_points").insert({ name, ssid, model_code: body?.modelCode || "EAP110-Outdoor", mac_address: macAddress, ip_address: ipAddress, status: "provisioning" }).select("id,name,ssid,model_code,ip_address,mac_address,status,client_count,band,firmware,last_seen_at,reboot_requested_at,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "An access point with this MAC address already exists." : "Unable to add access point." }, { status: error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ accessPoint: data }, { status: 201 });
}
