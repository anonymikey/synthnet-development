"use client";

import { AlertTriangle } from "lucide-react";
import { ColorField, FileField, RangeField, SelectField } from "@/components/ui/form";
import type { ImagePanelProps } from "@/features/captive-portal/editor/types";
import { contrastRatio } from "@/lib/utils/color";
import type { PortalAlign, PortalBackgroundMode, PortalFont } from "@/types/portal";

const BACKGROUND_MAX_BYTES = 500 * 1024;

const MODE_OPTIONS: ReadonlyArray<{ value: PortalBackgroundMode; label: string }> = [
  { value: "solid", label: "Solid colour" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Image" },
];

const FONT_OPTIONS: ReadonlyArray<{ value: PortalFont; label: string }> = [
  { value: "sans", label: "Clean sans-serif" },
  { value: "serif", label: "Classic serif" },
  { value: "rounded", label: "Friendly rounded" },
  { value: "mono", label: "Monospace" },
];

const ALIGN_OPTIONS: ReadonlyArray<{ value: PortalAlign; label: string }> = [
  { value: "center", label: "Centred" },
  { value: "left", label: "Left-aligned" },
];

function ContrastWarning({ label, ratio }: { label: string; ratio: number }) {
  if (ratio >= 4.5) return null;
  return (
    <p role="status" className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>
        {label} has low contrast ({ratio.toFixed(1)}:1). Aim for at least 4.5:1 so it stays readable on phones in sunlight.
      </span>
    </p>
  );
}

export function LookPanel({ config, onChange, onError }: ImagePanelProps) {
  const { theme } = config;
  const setTheme = (patch: Partial<typeof theme>) => onChange({ ...config, theme: { ...theme, ...patch } });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Accent (buttons)" value={theme.primaryColor} onChange={(primaryColor) => setTheme({ primaryColor })} />
        <ColorField label="Page text" value={theme.textColor} onChange={(textColor) => setTheme({ textColor })} />
        <ColorField label="Card background" value={theme.cardColor} onChange={(cardColor) => setTheme({ cardColor })} />
        <ColorField label="Card text" value={theme.cardTextColor} onChange={(cardTextColor) => setTheme({ cardTextColor })} />
      </div>

      <ContrastWarning label="Page text on the page background" ratio={contrastRatio(theme.textColor, theme.backgroundColor)} />
      <ContrastWarning label="Card text on the card" ratio={contrastRatio(theme.cardTextColor, theme.cardColor)} />

      <SelectField
        label="Page background"
        value={theme.backgroundMode}
        options={MODE_OPTIONS}
        onChange={(backgroundMode) => setTheme({ backgroundMode })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label={theme.backgroundMode === "gradient" ? "Gradient start" : "Background colour"}
          value={theme.backgroundColor}
          onChange={(backgroundColor) => setTheme({ backgroundColor })}
        />
        {theme.backgroundMode === "gradient" ? (
          <ColorField
            label="Gradient end"
            value={theme.gradientEndColor}
            onChange={(gradientEndColor) => setTheme({ gradientEndColor })}
          />
        ) : null}
      </div>

      {theme.backgroundMode === "image" ? (
        <div className="space-y-4">
          <FileField
            label="Background image"
            accept="image/png,image/jpeg,image/webp"
            maxBytes={BACKGROUND_MAX_BYTES}
            previewSrc={theme.backgroundImage}
            hint="JPG, PNG or WebP up to 500 KB. Smaller images load faster on slow connections."
            onLoad={(backgroundImage) => setTheme({ backgroundImage })}
            onClear={() => setTheme({ backgroundImage: null })}
            onError={onError}
          />
          <RangeField
            label="Darken image"
            value={theme.imageOverlay}
            min={0}
            max={80}
            unit="%"
            onChange={(imageOverlay) => setTheme({ imageOverlay })}
          />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Font" value={theme.font} options={FONT_OPTIONS} onChange={(font) => setTheme({ font })} />
        <SelectField
          label="Header alignment"
          value={theme.align}
          options={ALIGN_OPTIONS}
          onChange={(align) => setTheme({ align })}
        />
      </div>
      <p className="-mt-2 text-xs text-muted">
        Fonts use the visitor&apos;s device fonts, so the portal loads before they have internet access.
      </p>

      <RangeField
        label="Corner roundness"
        value={theme.cornerRadius}
        min={0}
        max={28}
        unit="px"
        onChange={(cornerRadius) => setTheme({ cornerRadius })}
      />
    </div>
  );
}
