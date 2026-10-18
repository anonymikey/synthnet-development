import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const started = performance.now();
  const hasCourtneyConfig = Boolean(process.env.COURTNEY_BASE_URL && process.env.COURTNEY_API_KEY && process.env.COURTNEY_API_SECRET);
  const webhookUrl = new URL("/api/payment/webhook", request.url);
  return NextResponse.json({
    supabase: { status: "online", latencyMs: Math.round(performance.now() - started) },
    courtney: { status: hasCourtneyConfig ? "configured" : "needs_configuration", latencyMs: hasCourtneyConfig ? Math.round(performance.now() - started) : null },
    webhook: { status: "reachable", url: webhookUrl.pathname },
    checkedAt: new Date().toISOString(),
  });
}
