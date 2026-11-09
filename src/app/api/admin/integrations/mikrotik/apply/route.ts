import { NextResponse } from "next/server";
import { executeMikrotikScript } from "@/lib/mikrotik-rest";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { url?: string; username?: string; password?: string; script?: string; confirmation?: string } | null;
  if (body?.confirmation !== "APPLY TO ROUTER") return NextResponse.json({ error: "Type APPLY TO ROUTER to confirm the live RouterOS change." }, { status: 400 });
  if (!body.url || !body.username || !body.password || !body.script) return NextResponse.json({ error: "Router credentials and a reviewed script are required." }, { status: 400 });
  if (body.script.length > 16000) return NextResponse.json({ error: "Script is too large." }, { status: 400 });
  try {
    const result = await executeMikrotikScript({ url: body.url, username: body.username, password: body.password }, body.script);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "RouterOS script execution failed." }, { status: 502 });
  }
}
