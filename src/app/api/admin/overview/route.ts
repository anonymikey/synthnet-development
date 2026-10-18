import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const [{ data: transactions, error: transactionsError }, { data: sessions, error: sessionsError }] = await Promise.all([
    supabase.from("transactions").select("id,phone_number,amount,status,gateway_type,mpesa_checkout_id,callback_metadata,created_at,package_id,packages(name)").order("created_at", { ascending: false }).limit(100),
    supabase.from("active_sessions").select("id,client_mac,ap_mac,gateway_type,session_start,session_end,status,transaction_id").eq("status", "active").order("session_start", { ascending: false }).limit(100),
  ]);

  if (transactionsError || sessionsError) {
    return NextResponse.json({
      metrics: { revenue: 0, previousRevenue: 0, transactions: 0, completed: 0, pending: 0, activeSessions: 0, conversionRate: 0, revenueDay: 0, revenueWeek: 0, revenueMonth: 0, mikrotikRevenue: 0, omadaRevenue: 0, mikrotikSessions: 0, omadaSessions: 0, devicesOnline: 0, devicesTotal: 0, throughput: { mikrotik: [], omada: [] } },
      transactions: [],
      sessions: [],
    });
  }

  const rows = transactions ?? [];
  const completed = rows.filter((row) => row.status === "completed");
  const revenue = completed.reduce((sum, row) => sum + Number(row.amount), 0);
  const pending = rows.filter((row) => row.status === "pending").length;
  const now = Date.now();
  const revenueFor = (days: number) => completed.filter((row) => now - new Date(row.created_at).getTime() <= days * 86400000).reduce((sum, row) => sum + Number(row.amount), 0);
  const mikrotikRevenue = completed.filter((row) => row.gateway_type === "mikrotik").reduce((sum, row) => sum + Number(row.amount), 0);
  const omadaRevenue = completed.filter((row) => row.gateway_type === "omada").reduce((sum, row) => sum + Number(row.amount), 0);

  return NextResponse.json({
    metrics: { revenue, previousRevenue: revenueFor(30), transactions: rows.length, completed: completed.length, pending, activeSessions: sessions?.length ?? 0, conversionRate: rows.length ? Math.round((completed.length / rows.length) * 100) : 0, revenueDay: revenueFor(1), revenueWeek: revenueFor(7), revenueMonth: revenueFor(30), mikrotikRevenue, omadaRevenue, mikrotikSessions: (sessions ?? []).filter((row) => row.gateway_type === "mikrotik").length, omadaSessions: (sessions ?? []).filter((row) => row.gateway_type === "omada").length, devicesOnline: 0, devicesTotal: 0, throughput: { mikrotik: [], omada: [] } },
    transactions: rows.slice(0, 100),
    sessions: sessions ?? [],
  });
}
