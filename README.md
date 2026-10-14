# SYNTHNET

Hotspot ISP billing, subscriber management and multi-vendor network operations (MikroTik and TP-Link Omada).

**Current release: v0.4.0 (Phase 1, UI-first). Milestone 5: TP-Link Omada module, alongside the MikroTik module, the operations dashboard, the editable captive portal and the Milestone 0 foundation.**

> **Phase 1 has no live backend integrations.** There is no database, no authentication, no M-Pesa processing,
> no email, and no connection to any MikroTik router or Omada controller. Everything on screen is simulated demo
> data, and every simulated action says so.

## Stack

Next.js (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 3 · Framer Motion · Lucide React · npm

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run check      # runs all three
```

No environment variables are required. Do not add secrets to this project in Phase 1.

## Routes

| Route | Purpose |
|---|---|
| `/` | Public landing page with an interactive captive-portal demo |
| `/login` | Frontend-only sign-in mockup (no credentials are checked) |
| `/dashboard` | Unified operations dashboard (see below), demo data only |
| `/admin/captive-portal` | Captive portal editor with live preview |
| `/admin/mikrotik` | MikroTik module: routers, leases, profiles, hardware catalog, Phase 2 guide |
| `/admin/omada` | Omada module: controller, access points, clients, portal hook, model catalog, standalone setup |
| `/portal` | The public captive portal page, rendered from the saved config |

Sidebar items marked **Planned** (Subscribers, Billing, Payments, Analytics, Settings) are
deliberately disabled until their milestones are built.

## TP-Link Omada module (`/admin/omada`)

Lives entirely in `src/features/omada/`, independent of MikroTik, and **simulated**: it never contacts a controller or an
access point. It models Omada access points that broadcast the network and send unauthenticated clients to the SYNTHNET
portal **without any MikroTik hotspot**. A router or gateway (any brand) must still provide DHCP and internet, because
access points only bridge Wi-Fi onto the wired network.

| File | Role |
|---|---|
| `omada.types.ts` | Types: AP and controller models, tenant, controller, site, SSIDs, access points, clients, plans, portal config |
| `omada.catalog.ts` | 8 access point models and 3 controller options, with verified specs (unverified fields are `null`) |
| `omada.mock.ts` | One demo tenant: EAP110-Outdoor and EAP225-Outdoor (AC1200) access points with 22 wireless clients; `EXTERNAL_PORTAL_URL` |
| `omada.capabilities.ts` | Plain-language summaries and badge chips derived from a model |
| `omada.logic.ts` | Pure helpers: filters, sort, paginate, totals, portal redirect URL builder |
| `omada.compat.ts` | Setup and compatibility reference: redirect parameters, authorize fields, standalone checklist, open questions |
| `components/` | Controller card, AP inventory and detail, client grid, portal panel, catalog, setup guide, add-AP dialog |

Tabs: **Access points**, **Clients** (search, filters, sort, pagination, simulated authorize and disconnect),
**Portal hook**, **Models** (cards or matrix, plus controller options) and **Standalone setup** (tick-list).

### The portal hook

Unauthenticated clients on the guest SSID are sent to `EXTERNAL_PORTAL_URL`
(`https://synthnet.anonymiketech.space/portal`, set in `omada.mock.ts`). The Portal tab builds the real redirect URL for
each waiting demo client using TP-Link's documented External Portal parameters, in order: `clientMac`, `apMac`, `ssidName`,
`t`, `radioId`, `site`, `redirectUrl`.

Not verified, to confirm against your controller in Phase 2: the MAC separator style in `clientMac`, the `radioId`
numbering, and the exact controller account type used to authorize clients. Authorizing a client after payment is a
Phase 2 server-side task. Credentials must never be placed in browser code.

### Notes

- The "AC1200" access point is assumed to be the **EAP225-Outdoor**, because TP-Link sells several AC1200 models.
- The EAP110-Outdoor is **2.4 GHz only (N300) with a 10/100 port**; the demo data respects that (no 5 GHz clients on it).
- Photos in `public/images/omada/`: the EAP225-Outdoor shares the EAP110-Outdoor's enclosure, so its photo is marked
  *representative*. Models without a photo show a placeholder. Photos could not be fetched from the web in the build
  environment, so only operator-supplied photos are embedded.
- Isolation: `features/omada` imports only shared UI, utilities and the primitive types `@/types/portal` and `@/types/vendor`;
  nothing else imports it except its route file, and it never references the MikroTik module.

## MikroTik module (`/admin/mikrotik`)

Lives entirely in `src/features/mikrotik/` and is isolated from any other vendor. It is **read-only and simulated**: it
never writes to a router, and the existing MikroTik configuration is treated as a protected compatibility boundary.

| File | Role |
|---|---|
| `mikrotik.types.ts` | Types: hardware models, routers, hotspot servers, billing profiles, client leases, compatibility docs |
| `mikrotik.catalog.ts` | Hardware catalog (9 models) with RAM, CPU cores, ports, Wi-Fi, PoE, capability flags and photos |
| `mikrotik.mock.ts` | One demo tenant: an RB951Ui-2nD gateway with 26 client leases on a KES 600 base tier structure |
| `mikrotik.capabilities.ts` | Plain-language summaries and badge chips derived from a model |
| `mikrotik.logic.ts` | Pure helpers (filter, sort, paginate, totals, validation) |
| `mikrotik.compat.ts` | Phase 2 compatibility reference: RouterOS exports and `login.html` variables SYNTHNET will expect |
| `components/` | Router inventory and detail, lease grid, profiles, catalog, Phase 2 guide, add-router dialog |

Tabs: **Routers** (inventory, photo, metrics, capability badges), **Leases** (search, filters, sort, pagination,
simulated disconnect), **Profiles & servers**, **Hardware catalog** (cards or comparison matrix) and **Phase 2 guide**.

### Hardware catalog notes

- Specifications were checked on 2026-10-12 against MikroTik's own product pages where available (RB951Ui-2HnD,
  RB4011iGS+RM, RB5009UG+S+IN) and otherwise against several retailer listings of MikroTik's datasheet. Always confirm
  a real device with `/system resource print` and `/system routerboard print`.
- **The RB951Ui-2nD has 64 MB RAM**; 128 MB belongs to the RB951Ui-2HnD. The catalog uses the verified values.
- Tier names and recommendation labels (for example "Core ISP Gateway") are operator positioning, not MikroTik claims.
- Photos live in `public/images/mikrotik/`. Provenance is recorded per model: *provided*, *inferred* (matched by
  appearance, flagged in the UI) or *representative* (same product family). Models without a photo show a placeholder.
  To add one, drop a file in that folder and set `hardwareImage` on the model in `mikrotik.catalog.ts`.

### Isolation rule

`features/mikrotik` imports only shared UI (`components/ui`), utilities (`lib/utils`) and the primitive types
`@/types/portal` and `@/types/vendor`. Nothing else in the app imports it except its route file. Keep it that way when
the Omada module is built.

## Operations dashboard (`/dashboard`)

- **Vendor filter** (All / MikroTik / TP-Link Omada) scopes device cards, charts, alerts and activity. Vendor
  metrics are never summed: MikroTik *hotspot sessions* and Omada *wireless clients* are shown side by side and
  labelled as counted differently.
- **Traffic chart** with metric (throughput or connected users) and time range (24 hours, 7 days, 30 days).
  Vendors are drawn as separate lines, distinguished by dash style as well as colour.
- **Vendor health panels** with status bars (online / warning / offline, each with a text count) and
  vendor-specific figures.
- **Subscribers**: account status and active subscribers by plan.
- **Billing**: six-month revenue chart, invoice status, and a recent-payments table with a status filter.
- **Alerts**: severity filter and simulated acknowledge / reopen. Acknowledging only changes browser state.
- **Refresh** only simulates loading; the numbers are static.

Demo data is internally consistent and checked by tests outside this repo: plan subscribers sum to active
subscribers, alert counts match device warning/offline counts, the "connected users" chart ends on the current
figure, and payment amounts match plan prices.

## Captive portal

The editor (`/admin/captive-portal`) edits a draft of the portal and shows it in a live preview (phone or wide size).
Editable: business name, tagline, logo upload, colours, background (solid, gradient or image), font, corner
roundness, header alignment, all headline and button wording, subscription plans (add, edit, reorder, delete),
M-Pesa / voucher / free-trial options, terms, support contacts and footer. Config can be exported and imported as JSON.

- **Save changes** stores the config in this browser's `localStorage`. `/portal` reads it from there.
- Nothing is shared between browsers or devices in Phase 1.
- The portal uses system fonts only, because a real captive portal loads before the visitor has internet access.
- All portal flows (M-Pesa prompt, voucher check, free trial) are simulated and labelled as demo.

### MikroTik compatibility boundary

The existing MikroTik hotspot login is **not** touched, replaced or assumed by this project. How hotspot users get
redirected to this portal (from MikroTik or Omada) is a Phase 2 topic and needs the current MikroTik configuration
export and `login.html` to be reviewed first.

## Project structure

```
src/app/                  routes and layouts ((admin) group wraps the dashboard shell)
src/components/ui/        shared primitives (Button, Card, Badge, Tabs, Toast, ConfirmDialog, form fields)
src/components/layout/    AppShell, SidebarNav, Topbar, PageHeader, Logo
src/features/             feature modules: captive-portal, dashboard (UI + pure dashboard-logic.ts), mikrotik, omada, auth, landing
src/lib/mock-data/        deterministic demo data: overview, billing, portal defaults (never fetched, never random)
src/lib/mock-services/    simulated, browser-only operations (portal storage)
src/lib/utils/            formatting, colour and small helpers
src/types/                domain types (vendor, overview, portal)
scripts/                  release packaging
```

### Mock-data architecture

1. **Types** (`src/types`) define the domain.
2. **Mock data** (`src/lib/mock-data`) is typed, static and consistent (for example, alert counts match device counts).
3. **Mock services** (`src/lib/mock-services`) simulate operations in the browser only.
4. **Components** consume typed data and never hold hardcoded datasets in JSX.

Vendor-specific types live apart (`MikrotikOverview`, `OmadaOverview`); there is no universal device interface.
MikroTik and Omada modules will get separate feature folders when they are built.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel (framework preset: Next.js). No environment variables are needed.
3. Build command `next build`, output handled by Vercel.

## Releases

```bash
npm run package:release -- <label>     # e.g. initial-ui
```

Creates `release/SYNTHNET_v<version>_<label>.zip`, a complete snapshot that excludes `node_modules`, `.next`, `.git`,
build caches and `.env*` files. Increment `version` in `package.json` before each release.

## Phase 1 status

Done: foundation, landing page, admin shell, operations dashboard, captive portal editor, MikroTik module, Omada module.
**Still to build before Phase 1 is complete:** subscriber and billing screens (Milestone 6), analytics and settings
(Milestone 7), and the release-candidate review (Milestone 8). Their sidebar items remain marked Planned. Phase 2
(Supabase, authentication, M-Pesa, live vendor APIs) has not been started and needs explicit approval.

## Known limitations (v0.4.0)

- MikroTik leases join DHCP and hotspot concepts into one record; the real join is a Phase 2 decision.
- Omada photos exist only for the EAP110-Outdoor family; six Omada models show a placeholder.
- The portal page does not yet read the redirect parameters (`clientMac` etc.); that is Phase 2.
- Photos for hAP ac², hAP ax² and RB4011iGS+RM are still missing; two photos are matched by appearance.
- Charts are dependency-free SVG; there is no tooltip or zoom yet.
- The mobile navigation drawer closes with Escape and the close button but does not trap focus.
- Portal data is per-browser (`localStorage`); large images can exceed browser storage limits (the editor warns).
