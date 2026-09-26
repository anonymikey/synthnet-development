# SynthNet Backend API

Base URL is the Render service URL. JSON responses use `{ data }` for successful resource reads and `{ error }` for failures.

## Public endpoints

- `GET /health` — no authentication. Returns service and database health.
- `GET /api/v1/packages` — no authentication. Returns active packages from `public.packages`.
- `GET /api/v1/payments/:id` — no authentication for the minimal payment-pending flow. Returns only safe payment fields.
- `GET /api/v1/sessions/:id` — no authentication for the customer portal. Returns safe session timing and router-authentication state.
- `POST /api/v1/payments/webhook` — Courtney Tech only. Requires `x-courtney-secret` or `x-api-secret`; the body must include `CheckoutRequestID`, `Amount`, and integer `ResultCode`. Successful callbacks call the existing atomic `process_successful_payment` RPC; failures call `mark_failed_payment`.

Unknown checkout IDs, malformed payloads, invalid secrets, amount mismatches, duplicate callbacks, and missing device bindings are rejected or safely acknowledged without creating a second session.

## Admin foundation

- `GET /api/v1/admin/overview` — Supabase bearer token for an active `admin_profiles` record. Returns recent payments, active sessions, and router status. No service credentials are returned.

Admin routes are intentionally role-gated through Supabase Auth and the existing `admin_profiles` table. Router command execution is not exposed; Phase 3 should consume structured `router_jobs` records through an outbound agent.

## Error responses

`400` validation error, `401` missing/invalid authentication, `403` inactive/non-admin user, `404` missing resource, `429` rate limit, `500` unexpected server error, and `503` dependency unavailable. Provider secrets and raw database errors are never returned.

## Render configuration

Set `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `COURTNEY_TECH_API_SECRET`, and optionally `CORS_ORIGINS` from `backend/.env.example`. The service binds to `0.0.0.0` and never exposes the service-role key to the browser.
