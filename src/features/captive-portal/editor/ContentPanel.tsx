"use client";

import { TextAreaField, TextField } from "@/components/ui/form";
import type { PanelProps } from "@/features/captive-portal/editor/types";

export function ContentPanel({ config, onChange }: PanelProps) {
  const { content } = config;
  const setContent = (patch: Partial<typeof content>) => onChange({ ...config, content: { ...content, ...patch } });

  return (
    <div className="space-y-5">
      <TextField label="Headline" value={content.headline} maxLength={80} onChange={(headline) => setContent({ headline })} />
      <TextAreaField
        label="Subtitle"
        value={content.subtitle}
        maxLength={200}
        onChange={(subtitle) => setContent({ subtitle })}
        hint="Leave empty to hide it."
      />
      <TextField
        label="Plans heading"
        value={content.plansTitle}
        maxLength={60}
        onChange={(plansTitle) => setContent({ plansTitle })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Pay button"
          value={content.payButtonLabel}
          maxLength={40}
          onChange={(payButtonLabel) => setContent({ payButtonLabel })}
        />
        <TextField
          label="Voucher button"
          value={content.voucherButtonLabel}
          maxLength={40}
          onChange={(voucherButtonLabel) => setContent({ voucherButtonLabel })}
        />
        <TextField
          label="Trial button"
          value={content.trialButtonLabel}
          maxLength={40}
          onChange={(trialButtonLabel) => setContent({ trialButtonLabel })}
        />
      </div>
      <TextField
        label="Success title"
        value={content.successTitle}
        maxLength={60}
        onChange={(successTitle) => setContent({ successTitle })}
      />
      <TextAreaField
        label="Success message"
        value={content.successMessage}
        maxLength={240}
        onChange={(successMessage) => setContent({ successMessage })}
      />
      <TextField
        label="Footer text"
        value={content.footerText}
        maxLength={80}
        onChange={(footerText) => setContent({ footerText })}
      />
    </div>
  );
}
