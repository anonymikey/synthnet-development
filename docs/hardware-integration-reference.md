
## Current integration implementation

The setup wizard now exposes server-side connection tests. MikroTik RouterOS 7 uses the HTTPS REST endpoint under `/rest` with HTTP Basic Auth; RouterOS 6 remains script-generation only because its documented binary API uses TCP 8728/8729 and requires a dedicated binary-protocol client. RouterOS script execution is available only through an explicit backend confirmation phrase and should be used after a backup and interface review.

Omada Open API uses client credentials to request an access token and then lists sites through `/openapi/v1/{omadacId}/sites`. The wizard tests this connection without storing the client secret. The external portal adapter now follows TP-Link's documented controller-ID path, JSON hotspot login, returned session cookie, `Csrf-Token` header, and millisecond expiry payload.

Omada guest WLAN creation is deliberately represented as a reviewed provisioning plan rather than a guessed write request. TP-Link exposes the exact WLAN schema through the controller-specific Online API Document, and payloads vary by controller release and permissions. Applying an invented SSID payload could overwrite an existing wireless network. Once the target controller's exact WLAN endpoint/schema is confirmed, the plan endpoint can be extended with a versioned write adapter and a separate confirmation gate.
