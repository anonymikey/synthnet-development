import { NextResponse } from "next/server";
import { listOmadaSites } from "@/lib/omada-open-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { baseUrl?: string; omadacId?: string; clientId?: string; clientSecret?: string } | null;
  if (!body?.baseUrl || !body.omadacId || !body.clientId || !body.clientSecret) return NextResponse.json({ error: "Omada API URL, controller ID, client ID and client secret are required." }, { status: 400 });
  try {
    const result = await listOmadaSites({ baseUrl: body.baseUrl, omadacId: body.omadacId, clientId: body.clientId, clientSecret: body.clientSecret });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Omada Open API connection failed." }, { status: 502 });
  }
}
