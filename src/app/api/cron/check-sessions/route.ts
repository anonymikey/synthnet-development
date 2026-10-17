import { NextResponse } from "next/server";
import { processExpiredSessions } from "@/lib/session-eviction";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processExpiredSessions();
    return NextResponse.json({ ...result, checked_at: new Date().toISOString() }, { status: result.failed ? 207 : 200 });
  } catch {
    return NextResponse.json({ error: "Unable to check expired sessions." }, { status: 500 });
  }
}
