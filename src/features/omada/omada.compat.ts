import type { OpenQuestion, PortalParameter, SetupStep } from "@/features/omada/omada.types";

/**
 * ============================================================================================
 * OMADA COMPATIBILITY AND SETUP: documentation as data
 * ============================================================================================
 *
 * GOAL
 *   Let Omada access points broadcast the network and send unauthenticated clients to the SYNTHNET
 *   portal WITHOUT any MikroTik hotspot configuration. The MikroTik module and your existing
 *   MikroTik setup are not involved and are not touched.
 *
 * WHAT IS VERIFIED (TP-Link documentation, checked 2026-10-12)
 *   - The External Portal redirect URL format and its parameter names
 *     (TP-Link FAQ "API and Code Sample for External Portal Server", Omada Controller 5.0.15 or above).
 *   - The authorize request body fields sent to the controller.
 *   - The EAP110-Outdoor and EAP225-Outdoor datasheets list "Omada Controller V6.2 and above", and the
 *     EAP225-Outdoor datasheet lists "Pre-Authentication Access".
 *
 * WHAT IS NOT VERIFIED (confirm in Phase 2 against YOUR controller)
 *   - MAC address separator style in `clientMac` (colons vs dashes) and the numbering used by `radioId`.
 *   - The exact controller account type used to authorize clients through the API.
 *   - Menu labels, which differ between Omada Controller versions.
 *
 * WHAT PHASE 1 DOES
 *   Nothing here contacts a controller or an access point. The Portal tab builds redirect URLs from
 *   demo clients so you can see exactly what the controller would send. The authorize step is simulated.
 *
 * IMPORTANT NETWORK FACT
 *   Access points bridge Wi-Fi onto the wired network. They do not provide DHCP or internet routing.
 *   Some router or gateway (any brand, or an Omada gateway) must still do that. "Without MikroTik"
 *   means no MikroTik hotspot or hotspot login, not no router at all.
 *
 * SECURITY
 *   Controller credentials and the authorize call belong on a server, never in browser code. Phase 2
 *   will keep them in server-side secrets.
 */

/** Query parameters the controller appends when it redirects a client to the external portal. */
export const PORTAL_PARAMETERS: readonly PortalParameter[] = [
  { name: "clientMac", meaning: "MAC address of the client device." },
  { name: "apMac", meaning: "MAC address of the access point the client is connected to." },
  { name: "ssidName", meaning: "Name of the SSID the client joined." },
  { name: "t", meaning: "Timestamp, as time since epoch." },
  { name: "radioId", meaning: "Identifier of the radio the client is on. The values are defined by the controller." },
  { name: "site", meaning: "Name of the Omada site." },
  { name: "redirectUrl", meaning: "The page the client originally asked for, where it lands after sign-in." },
];

/** Body fields of the authorize request the portal sends to the controller after a successful payment. */
export const AUTHORIZE_FIELDS: readonly PortalParameter[] = [
  { name: "clientMac", meaning: "The client to authorize (from the redirect)." },
  { name: "apMac", meaning: "The access point (from the redirect)." },
  { name: "ssidName", meaning: "The SSID (from the redirect)." },
  { name: "radioId", meaning: "The radio (from the redirect)." },
  { name: "site", meaning: "The site name (from the redirect)." },
  { name: "time", meaning: "How long the authorization lasts. SYNTHNET would derive it from the plan the client paid for." },
  { name: "authType", meaning: "Authorization type. TP-Link's sample uses 4 for the external portal." },
];

export const SETUP_STEPS: readonly SetupStep[] = [
  {
    id: "network",
    title: "Provide DHCP and internet",
    detail:
      "Use any router or gateway. The access points bridge Wi-Fi onto this wired network. It does not need to be a MikroTik, and an Omada gateway is optional.",
    where: "network",
    phase: "now",
  },
  {
    id: "power",
    title: "Power and cable the access points",
    detail:
      "EAP110-Outdoor: 24 V passive PoE with the included adapter, 10/100 port. EAP225-Outdoor: 802.3af PoE or 24 V passive PoE, gigabit port. Plug them into the same LAN as the controller.",
    where: "network",
    phase: "now",
  },
  {
    id: "controller",
    title: "Run an Omada controller",
    detail:
      "Choose a software controller on your own PC or server, or an OC200 or OC300 hardware controller. The portal redirect is configured in the controller, so one is required. Current TP-Link datasheets for these access points list Omada Controller 6.2 or later.",
    where: "controller",
    phase: "now",
  },
  {
    id: "adopt",
    title: "Adopt the access points into one site",
    detail: "Adopt each access point and keep them in a single site so the portal sees one site name.",
    where: "controller",
    phase: "now",
  },
  {
    id: "ssid",
    title: "Create the guest SSID",
    detail: "Create an open SSID for the hotspot. Keep staff Wi-Fi on a separate WPA2-protected SSID with no portal.",
    where: "controller",
    phase: "now",
  },
  {
    id: "portal",
    title: "Set the portal to External Portal Server",
    detail: "In the controller's portal settings for the guest SSID, choose the External Portal Server type and enter the SYNTHNET portal URL shown on the Portal tab.",
    where: "controller",
    phase: "now",
  },
  {
    id: "preauth",
    title: "Allow the portal before sign-in",
    detail: "Use Pre-Authentication Access to allow the portal host, so the page can load before the client is authorized.",
    where: "controller",
    phase: "now",
  },
  {
    id: "read-params",
    title: "Portal reads the redirect parameters",
    detail: "The SYNTHNET portal reads clientMac, apMac, ssidName, radioId, site and redirectUrl from the redirect and carries them through checkout.",
    where: "synthnet",
    phase: "phase2",
  },
  {
    id: "authorize",
    title: "SYNTHNET authorizes the client",
    detail: "After M-Pesa confirms payment, SYNTHNET sends the authorize request to the controller from the server, with the duration for the paid plan.",
    where: "synthnet",
    phase: "phase2",
  },
  {
    id: "secrets",
    title: "Keep controller credentials on the server",
    detail: "Store the controller address and account as server-side secrets. Never expose them in browser code.",
    where: "synthnet",
    phase: "phase2",
  },
];

export const OPEN_QUESTIONS: readonly OpenQuestion[] = [
  { id: "ac1200", question: "Which AC1200 model do you have? The demo assumes the EAP225-Outdoor." },
  { id: "controller", question: "Which controller will you use (software, OC200 or OC300), and which version?" },
  { id: "router", question: "Which router or gateway will provide DHCP and internet at each site?" },
  { id: "scale", question: "How many sites and access points will there be, and are they all outdoors?" },
  { id: "plans", question: "How long should each paid plan authorize a client for, and at what speed?" },
  { id: "isolation", question: "Should guest clients be isolated from each other, and is a separate VLAN needed?" },
];
