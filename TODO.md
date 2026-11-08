# SYNTHNET parity milestone

## Public product experience

- [ ] The home page presents SynthNet as a Wi-Fi billing and network operations product with a clear primary CTA, a secondary dashboard/demo CTA, feature proof, setup steps, pricing, ROI calculator, FAQ and support contact.
- [ ] The home page uses SynthNet branding and explicitly distinguishes demo-only behavior from configured live integrations.

## Operator dashboard

- [ ] The dashboard shows revenue, conversion, active sessions and vendor/session health from the existing admin overview response.
- [ ] The dashboard provides direct next-step links for router setup, package management, voucher generation and active sessions.

## Active sessions

- [ ] `/admin/sessions` loads active sessions from the existing admin overview endpoint.
- [ ] Each session shows client identity, vendor, package/payment context when available, start/end times and current status.
- [ ] A disconnect action updates the session to ended and reports success or a clear error without silently claiming hardware eviction.

## Vouchers

- [ ] `/admin/vouchers` generates a requested number of local test vouchers using a selected plan and expiry.
- [ ] Generated vouchers can be copied, printed and exported as CSV.
- [ ] The UI labels browser-local vouchers as demo data and does not imply they are persisted or authorized on a router.

## Quality and delivery

- [ ] `public/manus-routes.json` lists every page route and excludes API routes.
- [ ] Lint, typecheck and production build pass after the changes.
- [ ] README documents the new testable routes and the remaining live integration boundaries.
