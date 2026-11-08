# SYNTHNET parity milestone

## Goal

Bring the SynthNet demo closer to the operator workflow shown by VunaFlow while preserving SynthNet's own multi-vendor scope. The milestone is intentionally test-first: it improves the public product story and makes the existing billing, router, voucher and active-session flows easy to exercise without claiming that live integrations are complete.

## Reference findings

VunaFlow's public experience emphasizes five operator outcomes: connect a MikroTik router with minimal setup, sell packages through M-Pesa, create and sell vouchers, see revenue and popular packages live, and inspect or disconnect active devices. Its marketing page also uses a clear trial CTA, pricing, ROI calculator, setup steps and FAQ.

SynthNet already has a stronger vendor model because it separates MikroTik and TP-Link Omada, plus it has backend seams for packages, payment callbacks, router onboarding, active sessions and gateway health. The main gap is discoverability and operator workflow: the public page is an interface preview, the live dashboard is visually sparse when Supabase is empty, and vouchers and active sessions are not first-class routes.

## Implementation

1. Refresh the public landing page using SynthNet branding, with a conversion-oriented hero, feature proof, pricing, ROI calculator, setup steps, FAQ and a direct support CTA. Keep claims explicitly framed as demo/live-configuration dependent.
2. Add first-class `/admin/sessions` and `/admin/vouchers` routes. Sessions load from the existing overview endpoint and allow a safe demo disconnect that marks the session ended. Vouchers are browser-local test vouchers with copy, print and CSV export actions; they do not imply a backend voucher database.
3. Expand the dashboard with revenue, conversion, active-session and next-step cards using the existing API response, plus quick links to router setup, packages, vouchers and sessions.
4. Add the static route manifest required by the web workflow and update the README to reflect the current implementation and its remaining integration limits.

## Project structure

- `src/app/page.tsx`: public product page and ROI calculator composition.
- `src/features/landing/`: landing-only interactive presentation components.
- `src/features/sessions/`: live-session table and disconnect interaction.
- `src/features/vouchers/`: browser-local voucher generator and export actions.
- `src/app/api/admin/sessions/[id]/disconnect/route.ts`: session termination endpoint.
- `src/lib/nav.ts`: admin navigation and breadcrumb registry.
- `public/manus-routes.json`: complete page-route declaration.

## Design

### Considered directions

- **Operator neon** (0.06): dark control-room UI with electric cyan and violet accents.
- **Warm fintech** (0.04): cream canvas with orange payment cues and dense financial tables.
- **Utility terminal** (0.07): monochrome network-console styling with green status accents.

### Chosen direction: Operator neon

**Design movement:** Kenyan connectivity startup landing pages crossed with a high-signal network operations console.

**Core principles:** show the business result before the implementation detail; keep payment and network status visually distinct; use real-looking operational surfaces without fabricating live data; make every major CTA lead to a testable screen.

**Color philosophy:** retain SynthNet's dark ink/surface foundation, then add a restrained violet gradient for customer acquisition and cyan for operational actions. Violet signals growth and product ambition; cyan signals a live network control.

**Layout paradigm:** asymmetric editorial hero with a product-preview rail, followed by alternating proof bands and compact operational cards rather than a centered feature grid.

**Signature elements:** violet-to-cyan glow rules, pill-shaped operational status labels, and small “what happens next” step markers.

**Interaction philosophy:** interactions should expose system state immediately. Buttons should either navigate to a testable workflow or clearly say when an action is local/demo-only.

**Animation:** use existing motion primitives only for entrance and state transitions; respect reduced-motion preferences and avoid decorative looping effects.

**Typography system:** existing system sans stack, with tight bold display headlines and small uppercase utility labels for operational metadata.

**Brand essence:** “The Wi-Fi revenue console for operators who need billing and network control in one place.” Personality: direct, technical, trustworthy.

**Brand voice:** headlines are outcome-led and plain. Example lines: “Turn every access point into a paid network.” and “See who paid, who is online, and what to fix next.”

**Wordmark & logo:** retain the existing geometric SYNTHNET mark so the parity work improves the product around it rather than imitating VunaFlow's identity.

**Signature brand color:** SynthNet cyan (`#22d3c5`) paired with an ownable violet accent on acquisition surfaces.
