import { createAdminClient } from "@/lib/supabase/admin";

type Package = {
  duration_minutes: number;
  speed_limit_down_mbps: number;
  speed_limit_up_mbps: number;
};

type Transaction = {
  id: string;
  client_mac: string;
  ap_mac: string | null;
  gateway_type: "mikrotik" | "omada";
  package_id: string | null;
  packages: Package | Package[] | null;
};

type HotspotVariables = {
  mac?: string;
  ip?: string;
  username?: string;
};

export async function authorizeHardware(transaction: Transaction, hotspot: HotspotVariables) {
  const pkg = Array.isArray(transaction.packages)
    ? transaction.packages[0]
    : transaction.packages;
  if (!pkg) throw new Error("Transaction package is unavailable.");

  if (transaction.gateway_type === "omada") {
    return authorizeOmada(transaction, pkg);
  }

  return authorizeMikroTik(transaction, hotspot, pkg.duration_minutes);
}

async function authorizeOmada(transaction: Transaction, pkg: Package) {
  const controllerUrl = process.env.OMADA_CONTROLLER_URL?.replace(/\/$/, "");
  if (!controllerUrl) throw new Error("OMADA_CONTROLLER_URL is not configured.");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.OMADA_API_KEY) headers["X-API-Key"] = process.env.OMADA_API_KEY;
  if (process.env.OMADA_API_SECRET) headers["X-API-Secret"] = process.env.OMADA_API_SECRET;

  const response = await fetch(`${controllerUrl}/api/v2/hotspot/extPortal/auth`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      clientMac: transaction.client_mac,
      apMac: transaction.ap_mac,
      authStatus: 1,
      duration: pkg.duration_minutes * 60,
      upstream: pkg.speed_limit_up_mbps,
      downstream: pkg.speed_limit_down_mbps,
    }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false || result?.errorCode) {
    throw new Error(`Omada authorization failed (${response.status}).`);
  }

  return { provider: "omada" as const, result };
}

async function authorizeMikroTik(
  transaction: Transaction,
  hotspot: HotspotVariables,
  durationMinutes: number,
) {
  // Keep RouterOS/RADIUS handoff isolated until the controller integration is enabled.
  const variables = {
    mac: hotspot.mac ?? transaction.client_mac,
    ip: hotspot.ip,
    username: hotspot.username,
    durationMinutes,
    transactionId: transaction.id,
  };

  if (!variables.mac) throw new Error("MikroTik client MAC is required.");
  return { provider: "mikrotik" as const, result: variables };
}

export async function recordActiveSession(transaction: Transaction, expiresAt: Date) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("active_sessions").insert({
    client_mac: transaction.client_mac,
    ap_mac: transaction.ap_mac,
    gateway_type: transaction.gateway_type,
    session_start: new Date().toISOString(),
    session_end: expiresAt.toISOString(),
    status: "active",
    transaction_id: transaction.id,
  });

  if (error) throw new Error(`Active session could not be recorded: ${error.message}`);
}
