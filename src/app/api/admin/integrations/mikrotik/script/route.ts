import { NextResponse } from "next/server";
import { generateMikrotikScript, type MikrotikScriptInput } from "@/lib/mikrotik-rest";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Partial<MikrotikScriptInput> | null;
  const required = ["routerName", "routerOs", "service", "customerInterface", "gateway", "poolStart", "poolEnd", "portalUrl"] as const;
  if (!body || required.some((key) => !String(body[key] ?? "").trim())) return NextResponse.json({ error: "All MikroTik script fields are required." }, { status: 400 });
  if (body.routerOs !== "routeros6" && body.routerOs !== "routeros7") return NextResponse.json({ error: "Unsupported RouterOS version." }, { status: 400 });
  if (body.service !== "hotspot" && body.service !== "pppoe") return NextResponse.json({ error: "Unsupported RouterOS service." }, { status: 400 });
  try {
    return NextResponse.json({ script: generateMikrotikScript(body as MikrotikScriptInput), executable: false, note: "Review the generated script and router backup before applying it." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate script." }, { status: 400 });
  }
}
