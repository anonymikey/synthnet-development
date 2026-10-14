import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { DeviceStatus } from "@/types/vendor";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-raised text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon: Icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  );
}

const statusConfig: Record<DeviceStatus, { tone: BadgeTone; icon: LucideIcon; label: string }> = {
  online: { tone: "success", icon: CheckCircle2, label: "Online" },
  warning: { tone: "warning", icon: AlertTriangle, label: "Warning" },
  offline: { tone: "danger", icon: XCircle, label: "Offline" },
  unknown: { tone: "neutral", icon: HelpCircle, label: "Unknown" },
};

/** Status is always shown as icon + text, never colour alone. */
export function StatusBadge({ status }: { status: DeviceStatus }) {
  const { tone, icon, label } = statusConfig[status];
  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
