import "server-only";

export type OmadaOpenApiConfig = {
  baseUrl: string;
  omadacId: string;
  clientId: string;
  clientSecret: string;
};

function base(config: OmadaOpenApiConfig) {
  const value = config.baseUrl.trim().replace(/\/$/, "");
  if (!/^https:\/\//i.test(value)) throw new Error("Omada Open API requires an HTTPS base URL.");
  if (!config.omadacId.trim() || !config.clientId.trim() || !config.clientSecret.trim()) throw new Error("Omada Open API credentials are incomplete.");
  return value;
}

export async function omadaAccessToken(config: OmadaOpenApiConfig) {
  const response = await fetch(`${base(config)}/openapi/authorize/token?grant_type=client_credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ omadacId: config.omadacId, client_id: config.clientId, client_secret: config.clientSecret }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => null) as { errorCode?: number; msg?: string; result?: { accessToken?: string; expiresIn?: number } } | null;
  if (!response.ok || payload?.errorCode !== 0 || !payload.result?.accessToken) throw new Error(`Omada Open API authorization failed: ${payload?.msg ?? `HTTP ${response.status}`}`);
  return payload.result;
}

export async function listOmadaSites(config: OmadaOpenApiConfig) {
  const token = await omadaAccessToken(config);
  const response = await fetch(`${base(config)}/openapi/v1/${encodeURIComponent(config.omadacId)}/sites?pageSize=100&page=1`, {
    headers: { Accept: "application/json", Authorization: `AccessToken=${token.accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => null) as { errorCode?: number; msg?: string; result?: unknown } | null;
  if (!response.ok || payload?.errorCode !== 0) throw new Error(`Omada site listing failed: ${payload?.msg ?? `HTTP ${response.status}`}`);
  return { tokenExpiresIn: token.expiresIn ?? null, result: payload.result };
}

export type OmadaGuestPlan = { siteName: string; guestSsid: string; portalUrl: string; controllerId: string };

export function buildOmadaProvisioningPlan(input: OmadaGuestPlan) {
  return {
    mode: "review-before-apply",
    controllerId: input.controllerId,
    siteName: input.siteName,
    guestSsid: input.guestSsid,
    portalUrl: input.portalUrl,
    steps: [
      "Resolve or create the target site through the Omada Open API site operation.",
      "Create or update the guest WLAN using the controller's version-specific Open API schema.",
      "Set the WLAN portal type to External Portal Server and the supplied portal URL.",
      "Allow the portal hostname in Pre-Authentication Access.",
      "Verify the AP is adopted in the target site before enabling customer traffic.",
    ],
    note: "Omada publishes the exact WLAN payload in the controller-specific Online API Document. SynthNet will not guess a payload that could overwrite an existing SSID.",
  };
}
