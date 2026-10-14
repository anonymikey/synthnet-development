import { CreditCard, Palette, Router, Wifi } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { buttonStyles } from "@/components/ui/Button";
import { HeroPortal } from "@/features/landing/HeroPortal";
import { APP_VERSION } from "@/lib/version";

const FEATURES = [
  {
    icon: Palette,
    title: "A captive portal you can edit in minutes",
    body: "Change the logo, colours, wording, plans and payment options, and watch a live preview update as you type.",
  },
  {
    icon: CreditCard,
    title: "Subscribers and payments in one place",
    body: "Plans, invoices and M-Pesa payment screens sit next to the network they pay for. Phase 1 shows them with demo data.",
  },
  {
    icon: Router,
    title: "MikroTik stays exactly as it is",
    body: "Your existing MikroTik setup is treated as protected. The MikroTik module is built on its own so nothing about it has to change.",
  },
  {
    icon: Wifi,
    title: "TP-Link Omada alongside it",
    body: "Omada controllers, sites and access points get their own module and their own rules, inside the same console.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/portal" className={buttonStyles("ghost", "sm", "hidden sm:inline-flex")}>
            Portal demo
          </Link>
          <Link href="/dashboard" className={buttonStyles("ghost", "sm", "hidden sm:inline-flex")}>
            Dashboard
          </Link>
          <Link href="/login" className={buttonStyles("secondary", "sm")}>
            Sign in
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_auto] lg:pt-16">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Hotspot billing and the network behind it, in one console
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              SYNTHNET brings subscribers, payments, MikroTik routers and TP-Link Omada access points together, with a
              captive portal your customers actually enjoy using.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin/captive-portal" className={buttonStyles("primary", "lg")}>
                Edit the captive portal
              </Link>
              <Link href="/dashboard" className={buttonStyles("secondary", "lg")}>
                Open the dashboard
              </Link>
            </div>
            <p className="mt-6 max-w-md text-sm text-muted">
              The phone on this page is a working demo. Pick a plan and try it. Nothing is charged and nobody is
              connected.
            </p>
          </div>
          <HeroPortal />
        </section>

        <section aria-labelledby="features-heading" className="border-t border-line bg-surface/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 id="features-heading" className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
              One application, two network vendors that stay separate
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              Screens, tables and charts are shared so everything feels familiar. Vendor logic is not, because MikroTik
              and Omada do not work the same way.
            </p>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-accent">
                    <feature.icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted">{feature.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-lg border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold tracking-tight">This is the Phase 1 interface preview</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Every number, router, payment and subscriber you see is simulated demo data. There is no database, no
              live sign-in, no M-Pesa processing and no connection to any router or controller yet. Those come after
              the interface is reviewed and approved.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <Logo />
          <p className="text-sm text-muted">SYNTHNET v{APP_VERSION} · Phase 1 demo build</p>
        </div>
      </footer>
    </div>
  );
}
