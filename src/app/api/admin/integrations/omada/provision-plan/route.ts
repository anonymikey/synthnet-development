import { NextResponse } from "next/server";
import { buildOmadaProvisioningPlan } from "@/lib/omada-open-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { siteName?: string; guestSsid?: string; portalUrl?: string; controllerId?: string } | null;
  if (!body?.siteName?.trim() || !body.guestSsid?.trim() || !body.portalUrl?.startsWith("https://") || !body.controllerId?.trim()) return NextResponse.json({ error: "Site, guest SSID, HTTPS portal URL and controller ID are required." }, { status: 400 });
  return NextResponse.json({ plan: buildOmadaProvisioningPlan({ siteName: body.siteName.trim(), guestSsid: body.guestSsid.trim(), portalUrl: body.portalUrl.trim(), controllerId: body.controllerId.trim() }), executable: false });
}
