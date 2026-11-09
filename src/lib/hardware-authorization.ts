import { createAdminClient } from "@/lib/supabase/admin";
import { authorizeOmadaClient, revokeOmadaClient, type OmadaClientContext } from "@/lib/omada-hotspot";
type Package = { duration_minutes: number; speed_limit_down_mbps: number; speed_limit_up_mbps: number };
type Transaction = { id: string; client_mac: string; ap_mac: string | null; gateway_type: "mikrotik" | "omada"; package_id: string | null; packages: Package | Package[] | null; callback_metadata?: Record<string, unknown> | null };
type HotspotVariables = { mac?: string; ip?: string; username?: string };
function omadaContext(transaction: Transaction): OmadaClientContext {
  const details = transaction.callback_metadata ?? {};
  const clientMac = transaction.client_mac.trim();
  const apMac = transaction.ap_mac?.trim() ?? "";
  const ssidName = String(details.ssidName ?? "").trim();
  const site = String(details.site ?? "").trim();
  const radioId = Number(details.radioId);
  if (!clientMac || !apMac || !ssidName || !site || !Number.isInteger(radioId) || (radioId !== 0 && radioId !== 1)) {
    throw new Error("Omada portal context is incomplete. Reopen the captive portal from the controller.");
  }
  return { clientMac, apMac, ssidName, site, radioId };
}
export async function authorizeHardware(transaction: Transaction, hotspot: HotspotVariables) {
  const pkg = Array.isArray(transaction.packages) ? transaction.packages[0] : transaction.packages;
  if (!pkg) throw new Error("Transaction package is unavailable.");
  if (transaction.gateway_type === "omada") return authorizeOmadaClient(omadaContext(transaction), pkg.duration_minutes);
  const variables = { mac: hotspot.mac ?? transaction.client_mac, ip: hotspot.ip, username: hotspot.username, durationMinutes: pkg.duration_minutes, transactionId: transaction.id };
  if (!variables.mac) throw new Error("MikroTik client MAC is required.");
  if (!process.env.MIKROTIK_RADIUS_URL) throw new Error("MikroTik hotspot authorization is not configured.");
  return { provider: "mikrotik" as const, result: variables };
}
type ActiveSession = { client_mac: string; ap_mac: string | null; gateway_type: "mikrotik" | "omada"; callback_metadata?: Record<string, unknown> | null };
export async function evictHardwareSession(session: ActiveSession) {
  if (session.gateway_type === "omada") {
    const details = session.callback_metadata ?? {};
    return revokeOmadaClient({ clientMac: session.client_mac, apMac: session.ap_mac ?? "", ssidName: String(details.ssidName ?? ""), site: String(details.site ?? ""), radioId: Number(details.radioId) });
  }
  throw new Error("MikroTik session disconnect is not configured; connect the RouterOS/RADIUS adapter first.");
}
export async function recordActiveSession(transaction: Transaction, expiresAt: Date) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("active_sessions").insert({ client_mac: transaction.client_mac, ap_mac: transaction.ap_mac, gateway_type: transaction.gateway_type, session_start: new Date().toISOString(), session_end: expiresAt.toISOString(), status: "active", transaction_id: transaction.id });
  if (error) throw new Error(`Active session could not be recorded: ${error.message}`);
}
