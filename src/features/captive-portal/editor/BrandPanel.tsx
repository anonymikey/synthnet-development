"use client";

import { FileField, TextField } from "@/components/ui/form";
import type { ImagePanelProps } from "@/features/captive-portal/editor/types";

const LOGO_MAX_BYTES = 200 * 1024;

export function BrandPanel({ config, onChange, onError }: ImagePanelProps) {
  const { brand } = config;
  const setBrand = (patch: Partial<typeof brand>) => onChange({ ...config, brand: { ...brand, ...patch } });

  return (
    <div className="space-y-5">
      <TextField
        label="Business name"
        value={brand.name}
        maxLength={40}
        onChange={(name) => setBrand({ name })}
      />
      <TextField
        label="Tagline"
        value={brand.tagline}
        maxLength={80}
        hint="Shown under the business name. Leave empty to hide it."
        onChange={(tagline) => setBrand({ tagline })}
      />
      <FileField
        label="Logo"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        maxBytes={LOGO_MAX_BYTES}
        previewSrc={brand.logoDataUrl}
        hint="PNG, JPG, WebP or SVG up to 200 KB. Stored in this browser only."
        onLoad={(logoDataUrl) => setBrand({ logoDataUrl })}
        onClear={() => setBrand({ logoDataUrl: null })}
        onError={onError}
      />
      <TextField
        label="Logo initials"
        value={brand.logoInitials}
        maxLength={3}
        hint="Shown in a badge when no logo is uploaded."
        onChange={(logoInitials) => setBrand({ logoInitials })}
      />
    </div>
  );
}
