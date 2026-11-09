import "server-only";

export type MikrotikConnection = {
  url: string;
  username: string;
  password: string;
};

function normalizeUrl(value: string) {
  const url = value.trim().replace(/\/$/, "");
  if (!/^https:\/\//i.test(url)) throw new Error("RouterOS REST requires an HTTPS URL.");
  return url;
}

function authHeader(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

async function request(connection: MikrotikConnection, path: string, init: RequestInit = {}) {
  const url = normalizeUrl(connection.url);
  const response = await fetch(`${url}/rest/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Authorization: authHeader(connection.username, connection.password),
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "message" in payload ? String(payload.message) : `HTTP ${response.status}`;
    throw new Error(`RouterOS request failed: ${detail}`);
  }
  return payload;
}

export async function testMikrotikConnection(connection: MikrotikConnection) {
  const resource = await request(connection, "system/resource?.proplist=board-name,version,architecture-name,uptime");
  const interfaces = await request(connection, "interface?.proplist=name,type,disabled");
  return { resource: Array.isArray(resource) ? resource[0] ?? null : resource, interfaceCount: Array.isArray(interfaces) ? interfaces.length : 0 };
}

export type MikrotikScriptInput = {
  routerName: string;
  routerOs: "routeros6" | "routeros7";
  service: "hotspot" | "pppoe";
  customerInterface: string;
  gateway: string;
  poolStart: string;
  poolEnd: string;
  portalUrl: string;
};

function quote(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function generateMikrotikScript(input: MikrotikScriptInput) {
  const pool = "synthnet-pool";
  const address = `${input.gateway}/24`;
  const lines = [
    `# SYNTHNET generated RouterOS ${input.routerOs} ${input.service} plan`,
    `# Router: ${input.routerName}`,
    "# REVIEW REQUIRED: export a backup and verify the customer interface before applying.",
    `# Portal URL: ${input.portalUrl}`,
    ":do { /system backup save name=synthnet-before-change } on-error={ :log warning \"SYNTHNET backup failed\" }",
    `:if ([:len [/ip pool find name=${quote(pool)}]] = 0) do={ /ip pool add name=${quote(pool)} ranges=${quote(`${input.poolStart}-${input.poolEnd}`)} }`,
    `:if ([:len [/ip address find address=${quote(address)} interface=${quote(input.customerInterface)}]] = 0) do={ /ip address add address=${quote(address)} interface=${quote(input.customerInterface)} comment=\"SYNTHNET customer gateway\" }`,
    `:put \"SYNTHNET ${input.service} prerequisites prepared on ${input.customerInterface}\"`,
    "# DHCP server, HotSpot profile and RADIUS/PPPoE settings must be reviewed against the existing router before adding them.",
    "# This generated script deliberately stops before destructive or conflicting service creation.",
  ];
  return `${lines.join("\n")}\n`;
}

export async function executeMikrotikScript(connection: MikrotikConnection, script: string) {
  return request(connection, "execute", { method: "POST", body: JSON.stringify({ script }) });
}
