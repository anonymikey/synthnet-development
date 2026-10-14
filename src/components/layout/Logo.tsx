import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-raised stroke-line" />
      <path d="M9 21 16 9l7 12Z" fill="none" strokeWidth="1.6" strokeLinejoin="round" className="stroke-accent" />
      <circle cx="9" cy="21" r="2.4" className="fill-accent" />
      <circle cx="16" cy="9" r="2.4" className="fill-signal" />
      <circle cx="23" cy="21" r="2.4" className="fill-accent" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-md" aria-label="SYNTHNET home">
      <LogoMark />
      <span className="text-base font-bold tracking-tight text-fg">SYNTHNET</span>
    </Link>
  );
}
