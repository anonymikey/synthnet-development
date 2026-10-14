import type { ExportRequest, HotspotPageFile, HotspotVariable } from "@/features/mikrotik/mikrotik.types";

/**
 * ============================================================================================
 * MikroTik COMPATIBILITY LAYER: Phase 2 expectations (documentation as data)
 * ============================================================================================
 *
 * PURPOSE
 *   SYNTHNET must work alongside the EXISTING MikroTik hotspot setup without redesigning it.
 *   In Phase 2 we will read that setup from exports you provide, then adapt SYNTHNET to it.
 *   Nothing in Phase 1 reads from, or writes to, a router. This file only records what we
 *   will ask for and what we will look for.
 *
 * WHAT IS VERIFIED
 *   - `HOTSPOT_VARIABLES`, `HOTSPOT_PAGE_FILES` and the `/export` behaviour below were checked
 *     against MikroTik's documentation (help.mikrotik.com: "Hotspot customisation" and
 *     "Configuration Management") on 2026-10-12.
 *   - Menu paths and print parameters in `EXPORT_REQUESTS` follow standard RouterOS CLI usage
 *     but have NOT been run against your routers. Treat the exact output as unconfirmed until
 *     your first export arrives.
 *
 * EXPORT SAFETY (RouterOS)
 *   - RouterOS v7: `/export` hides sensitive values (passwords, keys) by default. Add
 *     `show-sensitive` only if you intend to include them. Do NOT include them here.
 *   - RouterOS v6: use `/export hide-sensitive`. The v7-only `show-sensitive` and the v6-only
 *     `hide-sensitive` parameters are not interchangeable.
 *   - A hidden-sensitive export is still not a fully sanitised file. Review it for public IP
 *     addresses, serial numbers, Wi-Fi names, usernames and customer data before sharing.
 *   - Never share a binary `/system backup`. It can contain secrets.
 *
 * WHAT SYNTHNET WILL EXPECT TO MAP
 *   RouterOS source                         → SYNTHNET type (mikrotik.types.ts)
 *   /system resource, /system routerboard   → MikrotikRouter + MikrotikModel match
 *   /ip hotspot                             → HotspotServer
 *   /ip hotspot profile                     → HotspotServer.serverProfile, loginBy, html-directory
 *   /ip hotspot user profile                → BillingProfile (rate-limit, shared-users, session-timeout)
 *   /ip dhcp-server lease                   → ClientLease (address, mac-address, host-name, status)
 *   /ip hotspot active                      → ClientLease.authorized, username, uptime, bytes
 *   hotspot html-directory (login.html …)   → how users are sent to the captive portal (see below)
 *
 * login.html AND THE CAPTIVE PORTAL
 *   MikroTik serves its own `login.html` and related pages from the hotspot's html-directory.
 *   The SYNTHNET portal (/portal) is a separate page. Connecting the two is a Phase 2 design
 *   topic: options include a redirecting login.html, or walled-garden access to a hosted
 *   portal. We will choose only after reviewing YOUR current files, because the way your
 *   login works today (CHAP vs PAP, RADIUS or local users, vouchers) decides what is safe.
 *   Until then the existing login stays exactly as it is.
 *
 * KNOWN OPEN QUESTIONS (answers needed from the real setup)
 *   1. Exact model and RouterOS version of each gateway (RB951Ui-2nD vs RB951Ui-2HnD matters:
 *      64 MB vs 128 MB RAM).
 *   2. Are hotspot users local (`/ip hotspot user`), RADIUS, or both?
 *   3. How do the existing KES plans map to hotspot user profiles (names, rate-limit, timeouts)?
 *   4. Is login CHAP, PAP, or both, and is a custom login.html in use?
 *   5. Is there one hotspot server per router, or several (VLANs / multiple interfaces)?
 *   6. How are existing vouchers or paid sessions created and expired today?
 */

export const EXPORT_REQUESTS: readonly ExportRequest[] = [
  {
    id: "resource",
    title: "Router identity and resources",
    command: "/system resource print",
    why: "Confirms RouterOS version, board name, CPU model, core count and total memory.",
    mapsTo: "MikrotikRouter, MikrotikModel (catalog match)",
    review: false,
  },
  {
    id: "routerboard",
    title: "Exact hardware model",
    command: "/system routerboard print",
    why: "Distinguishes similar models, for example RB951Ui-2nD from RB951Ui-2HnD. You can redact the serial number.",
    mapsTo: "MikrotikModel",
    review: true,
  },
  {
    id: "full-export",
    title: "Full configuration export",
    command: "/export compact file=synthnet-full",
    why: "The baseline for compatibility review. RouterOS v7 hides secrets by default; on v6 use /export hide-sensitive file=synthnet-full.",
    mapsTo: "All of the above",
    review: true,
  },
  {
    id: "hotspot-export",
    title: "Hotspot configuration export",
    command: "/ip hotspot export file=synthnet-hotspot",
    why: "Servers, server profiles, user profiles, walled garden and bindings in one file.",
    mapsTo: "HotspotServer, BillingProfile",
    review: true,
  },
  {
    id: "hotspot-servers",
    title: "Hotspot servers",
    command: "/ip hotspot print detail",
    why: "Interface, address pool, server profile and idle/keepalive timeouts per hotspot server.",
    mapsTo: "HotspotServer",
    review: false,
  },
  {
    id: "hotspot-profiles",
    title: "Hotspot server profiles",
    command: "/ip hotspot profile print detail",
    why: "login-by methods, html-directory, DNS name and whether RADIUS is used.",
    mapsTo: "HotspotServer.serverProfile, loginBy",
    review: false,
  },
  {
    id: "user-profiles",
    title: "Hotspot user profiles",
    command: "/ip hotspot user profile print detail",
    why: "rate-limit, shared-users and session-timeout: the basis for matching your plans to billing profiles.",
    mapsTo: "BillingProfile",
    review: false,
  },
  {
    id: "walled-garden",
    title: "Walled garden",
    command: "/ip hotspot walled-garden print",
    why: "Hosts that clients can reach before logging in. Relevant to a hosted portal and to M-Pesa callbacks.",
    mapsTo: "Phase 2 portal integration",
    review: false,
  },
  {
    id: "dhcp-leases",
    title: "DHCP lease count (counts only)",
    command: "/ip dhcp-server lease print count-only",
    why: "A privacy-safe size check. Do not send the full lease list; it contains customer device data.",
    mapsTo: "ClientLease (volume only)",
    review: false,
  },
  {
    id: "active-count",
    title: "Active hotspot sessions (counts only)",
    command: "/ip hotspot active print count-only",
    why: "A privacy-safe size check for the number of logged-in users.",
    mapsTo: "ClientLease.authorized (volume only)",
    review: false,
  },
];

/** Files in the hotspot html-directory that affect the login experience. Source: MikroTik docs. */
export const HOTSPOT_PAGE_FILES: readonly HotspotPageFile[] = [
  { file: "login.html", purpose: "Shown when the user is not logged in and no error occurred." },
  { file: "flogin.html", purpose: "Shown instead of login.html after a failed login; login.html is used if it is missing." },
  { file: "alogin.html", purpose: "Shown briefly after a successful login." },
  { file: "status.html", purpose: "Session status page for a logged-in user." },
  { file: "fstatus.html", purpose: "Status page variant used when the status request fails." },
  { file: "logout.html", purpose: "Shown after logout." },
  { file: "error.html", purpose: "Shown on fatal errors only." },
  { file: "radvert.html", purpose: "Redirects the client to a scheduled advertisement link." },
];

/**
 * `$(name)` variables substituted by the hotspot servlet inside its HTML pages. Source: MikroTik
 * "Hotspot customisation". `error`, `error-orig`, `chap-id`, `chap-challenge` and `popup` are
 * available on the login page only.
 */
export const HOTSPOT_VARIABLES: readonly HotspotVariable[] = [
  { name: "identity", meaning: "RouterOS identity name.", availableOn: "All servlet pages" },
  { name: "link-login", meaning: "Login page URL including the originally requested URL.", availableOn: "All servlet pages" },
  { name: "link-login-only", meaning: "Login page URL without the original URL. The form action target.", availableOn: "All servlet pages" },
  { name: "link-orig", meaning: "The URL the client originally requested.", availableOn: "All servlet pages" },
  { name: "link-status", meaning: "Link to the status page.", availableOn: "All servlet pages" },
  { name: "link-logout", meaning: "Link to the logout page.", availableOn: "All servlet pages" },
  { name: "mac", meaning: "The client's MAC address.", availableOn: "All servlet pages" },
  { name: "ip", meaning: "The client's IP address.", availableOn: "All servlet pages" },
  { name: "username", meaning: "The hotspot username, when known.", availableOn: "All servlet pages" },
  { name: "chap-id", meaning: "CHAP identifier, used to hash the password when login-by includes http-chap.", availableOn: "Login page only" },
  { name: "chap-challenge", meaning: "CHAP challenge, used together with chap-id.", availableOn: "Login page only" },
  { name: "error", meaning: "The error message after a failed login.", availableOn: "Login page only" },
  { name: "error-orig", meaning: "The original error before any translation.", availableOn: "Login page only" },
  { name: "popup", meaning: "Whether the status page should open as a popup.", availableOn: "Login page only" },
];

export const EXPORT_SAFETY_CHECKLIST: readonly string[] = [
  "RouterOS v7: a plain /export already hides passwords and keys. Do not add show-sensitive.",
  "RouterOS v6: add hide-sensitive to /export.",
  "Open the file and search for public IP addresses, serial numbers, Wi-Fi names and customer usernames before sharing.",
  "Send counts instead of lists for DHCP leases and active sessions.",
  "Never share a binary /system backup file.",
  "Do not paste the hotspot html files if they contain API keys, analytics IDs or other secrets.",
];
