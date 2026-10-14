import type { ReactNode } from "react";

/** A decorative phone-shaped frame used to preview the portal at mobile size. */
export function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="mx-auto h-[640px] w-[320px] max-w-full overflow-hidden rounded-[2.5rem] border-[10px] border-raised bg-ink shadow-pop"
    >
      <div className="h-full overflow-y-auto">{children}</div>
    </div>
  );
}
