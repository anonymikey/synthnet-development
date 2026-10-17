import { NextResponse } from "next/server";
import { processExpiredSessions } from "@/lib/session-eviction";

let lastRunAt = 0;
const MIN_INTERVAL_MS = 15_000;

export async function POST() {
  if (Date.now() - lastRunAt < MIN_INTERVAL_MS) {
    return NextResponse.json({ skipped: true }, { status: 202 });
  }
  lastRunAt = Date.now();

  try {
    const result = await processExpiredSessions();
    return NextResponse.json({ ...result, checked_at: new Date().toISOString() }, { status: result.failed ? 207 : 200 });
  } catch {
    return NextResponse.json({ error: "Unable to check expired sessions." }, { status: 500 });
  }
}
