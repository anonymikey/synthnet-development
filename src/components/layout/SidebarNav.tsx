"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { NAV_GROUPS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const Icon = item.icon;
  const rowClass = "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium";

  if (!item.href || item.planned) {
    return (
      <div aria-disabled="true" className={cn(rowClass, "cursor-not-allowed text-muted/60")}>
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        <Badge>Planned</Badge>
      </div>
    );
  }

  const active = !item.external && isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        rowClass,
        "transition-colors",
        active ? "bg-accent/10 text-accent" : "text-muted hover:bg-raised hover:text-fg",
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-xs font-medium text-muted">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                <NavRow item={item} pathname={pathname} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
