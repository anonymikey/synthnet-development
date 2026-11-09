import "server-only";

interface OmadaConfig {
  controllerUrl: string;
  controllerId: string;
  username: string;
  password: string;
}

function config(): OmadaConfig {
  const controllerUrl = process.env.OMADA_CONTROLLER_URL?.replace(/\/$/, "");
  const controllerId = process.env.OMADA_CONTROLLER_ID;
  const username = process.env.OMADA_HOTSPOT_USERNAME;
  const password = process.env.OMADA_HOTSPOT_PASSWORD;
  if (!controllerUrl || !controllerId || !username || !password) {
    throw new Error("Omada hotspot controller URL, controller ID and operator credentials are not configured.");
  }
  return { controllerUrl, controllerId, username, password };
}

function cookieHeader(setCookie: string | null): string {
  return (setCookie ?? "")
    .split(/,(?=[^;]+=)/)
    .map((cookie) => cookie.split(";", 1)[0].trim())
    .filter(Boolean)
    .join("; ");
}

function csrfToken(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const value = payload as { result?: { token?: unknown }; token?: unknown };
  return String(value.result?.token ?? value.token ?? "").trim();
}

async function login() {
  const settings = config();
  const response = await fetch(`${settings.controllerUrl}/${encodeURIComponent(settings.controllerId)}/api/v2/hotspot/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: settings.username, password: settings.password }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  const token = csrfToken(payload);
  const cookie = cookieHeader(response.headers.get("set-cookie"));
  if (!response.ok || !token || !cookie || (payload as { errorCode?: number } | null)?.errorCode) {
    throw new Error(`Omada controller login failed (${response.status}).`);
  }
  return { settings, token, cookie };
}

export interface OmadaClientContext {
  clientMac: string;
  apMac: string;
  ssidName: string;
  radioId: number;
  site: string;
}

export async function authorizeOmadaClient(context: OmadaClientContext, durationMinutes: number) {
  const session = await login();
  const expiresAtMicroseconds = (Date.now() + durationMinutes * 60_000) * 1000;
  const response = await fetch(
    `${session.settings.controllerUrl}/${encodeURIComponent(session.settings.controllerId)}/api/v2/hotspot/extPortal/auth`,
    {
      method: "POST",
      headers: {
        Cookie: session.cookie,
        "Csrf-Token": session.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        clientMac: context.clientMac,
        apMac: context.apMac,
        ssidName: context.ssidName,
        radioId: String(context.radioId),
        site: context.site,
        time: String(Math.floor(expiresAtMicroseconds / 1000)),
        authType: "4",
      }),
      cache: "no-store",
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || (payload as { errorCode?: number } | null)?.errorCode) {
    throw new Error(`Omada client authorization failed (${response.status}).`);
  }
  return { provider: "omada" as const, expiresAt: new Date(expiresAtMicroseconds / 1000).toISOString(), result: payload };
}

export async function revokeOmadaClient(context: OmadaClientContext) {
  // The documented external-portal API authorizes clients but does not define a verified revoke call.
  // Expiry remains authoritative; avoid sending an invented authStatus payload to a live controller.
  throw new Error(`Omada session revocation is not supported by the documented external-portal API for ${context.clientMac}.`);
}
