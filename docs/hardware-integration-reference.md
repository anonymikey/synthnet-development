# Hardware integration reference

This project’s live hardware setup must follow the vendor documentation below. The safe wizard intentionally does not execute these steps.

## TP-Link Omada

Source: [TP-Link Omada External Portal Server API](https://support.omadanetworks.com/us/document/13023/)

The controller redirects an EAP client to the external portal with `clientMac`, `apMac`, `ssidName`, `t`, `radioId`, `site`, and `redirectUrl`. The portal must preserve these values through checkout. After successful authentication, the portal logs in to `POST /api/v2/hotspot/login` using the Omada hotspot-operator account, retains the controller cookie and CSRF token, then posts to `/api/v2/hotspot/extPortal/auth?token=...` with the client identity, `time` as the expiry timestamp in microseconds, and `authType=4`. The portal and controller must allow the required HTTPS/certificate and cookie behavior.

Source: [TP-Link Omada device adoption guide](https://support.omadanetworks.com/us/document/13006/)

For local adoption, the AP and controller are normally on the same subnet; the AP appears as Pending and is adopted from the controller. Cloud adoption uses the device key or QR code. A controller, a reachable AP, a selected site and an adopted device are prerequisites; adding a MAC address to SynthNet’s inventory alone is not adoption.

## MikroTik RouterOS

Source: [MikroTik HotSpot captive portal documentation](https://help.mikrotik.com/docs/spaces/ROS/pages/56459266/HotSpot+-+Captive+portal)

A HotSpot setup requires an explicit customer-facing interface, gateway address, address pool, DNS/captive-portal name and authentication settings. RouterOS supports local or RADIUS authentication and a walled garden. HotSpot is IPv4-dependent in the documented behavior and must be run on the bridge/interface rather than a WAN port. RouterOS 7.3+ has RFC 7710 captive-portal signaling requirements involving a DNS name and valid HTTPS certificate.

The current repository onboarding callback only proves that a router fetched a one-time script. A production MikroTik adapter still needs an actual RouterOS/RADIUS or agent transport, reviewed interface settings, rollback/backup handling, and a live test with a customer device before it can be called fully functional.
