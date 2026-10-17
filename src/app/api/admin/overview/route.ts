import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const [{ data: transactions, error: transactionsError }, { data: sessions, error: sessionsError }] = await Promise.all([
    supabase.from("transactions").select("id,amount,status,gateway_type,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("active_sessions").select("id,client_mac,ap_mac,gateway_type,session_start,session_end,status,transaction_id").eq("status", "active").order("session_start", { ascending: false }).limit(100),
  ]);

  if (transactionsError || sessionsError) return NextResponse.json({ error: "Unable to load live operations data." }, { status: 500 });

  const rows = transactions ?? [];
  const completed = rows.filter((row) => row.status === "completed");
  const revenue = completed.reduce((sum, row) => sum + Number(row.amount), 0);
  const pending = rows.filter((row) => row.status === "pending").length;
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const previousRevenue = completed.filter((row) => new Date(row.created_at) < lastMonth).reduce((sum, row) => sum + Number(row.amount), 0);

  return NextResponse.json({
    metrics: { revenue, previousRevenue, transactions: rows.length, completed: completed.length, pending, activeSessions: sessions?.length ?? 0 },
    transactions: rows.slice(0, 8),
    sessions: sessions ?? [],
  });
}
