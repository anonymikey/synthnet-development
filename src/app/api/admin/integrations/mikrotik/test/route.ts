import { NextResponse } from "next/server";
import { testMikrotikConnection } from "@/lib/mikrotik-rest";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { url?: string; username?: string; password?: string } | null;
  if (!body?.url || !body.username || !body.password) return NextResponse.json({ error: "Router URL, username and password are required." }, { status: 400 });
  try {
    const result = await testMikrotikConnection({ url: body.url, username: body.username, password: body.password });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "RouterOS connection failed." }, { status: 502 });
  }
}
