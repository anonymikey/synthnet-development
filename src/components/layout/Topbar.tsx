"use client";

import { Bell, ChevronRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getBreadcrumbs } from "@/lib/nav";
import { networkAlerts } from "@/lib/mock-data/overview";
import { formatMinutesAgo } from "@/lib/utils/format";
import { VENDOR_LABELS } from "@/types/vendor";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-ink/85 px-4 backdrop-blur lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation menu"
        className="-ml-2 rounded-md p-2 text-muted hover:bg-raised hover:text-fg lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 truncate text-sm">
          {crumbs.map((crumb, index) => (
            <li key={crumb} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5 text-muted" /> : null}
              <span
                aria-current={index === crumbs.length - 1 ? "page" : undefined}
                className={index === crumbs.length - 1 ? "font-medium text-fg" : "text-muted"}
              >
                {crumb}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <Badge tone="info" className="hidden sm:inline-flex">
        Live operations
      </Badge>

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="notifications-panel"
          aria-label={`Notifications, ${networkAlerts.length} demo alerts`}
          className="relative rounded-md p-2 text-muted hover:bg-raised hover:text-fg"
        >
          <Bell aria-hidden="true" className="size-5" />
          <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
        </button>
        {open ? (
          <div
            id="notifications-panel"
            role="region"
            aria-label="Notifications"
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-line bg-raised p-2 shadow-pop"
          >
            <p className="px-2 py-1.5 text-xs text-muted">Demo alerts. Not from real devices.</p>
            <ul className="max-h-80 overflow-y-auto">
              {networkAlerts.slice(0, 4).map((alert) => (
                <li key={alert.id} className="rounded-md px-2 py-2 hover:bg-line/40">
                  <p className="text-sm font-medium text-fg">{alert.title}</p>
                  <p className="text-xs text-muted">
                    {VENDOR_LABELS[alert.vendor]} · {formatMinutesAgo(alert.minutesAgo)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div
        aria-label="Signed in as Demo Admin (demo, no real account)"
        role="img"
        className="flex size-8 items-center justify-center rounded-full border border-line bg-raised text-xs font-semibold text-fg"
      >
        DA
      </div>
    </header>
  );
}
