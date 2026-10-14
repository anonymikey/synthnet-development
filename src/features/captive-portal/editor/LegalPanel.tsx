"use client";

import { TextAreaField, TextField, ToggleField } from "@/components/ui/form";
import type { PanelProps } from "@/features/captive-portal/editor/types";

export function LegalPanel({ config, onChange }: PanelProps) {
  const { sections, content } = config;
  const setSections = (patch: Partial<typeof sections>) => onChange({ ...config, sections: { ...sections, ...patch } });
  const setContent = (patch: Partial<typeof content>) => onChange({ ...config, content: { ...content, ...patch } });

  return (
    <div className="space-y-6">
      <section aria-labelledby="terms-heading" className="space-y-4">
        <h3 id="terms-heading" className="text-sm font-semibold text-fg">
          Terms of use
        </h3>
        <ToggleField label="Show terms" checked={sections.showTerms} onChange={(showTerms) => setSections({ showTerms })} />
        {sections.showTerms ? (
          <>
            <ToggleField
              label="Require acceptance"
              description="People must tick a box before they can connect."
              checked={sections.requireTermsAcceptance}
              onChange={(requireTermsAcceptance) => setSections({ requireTermsAcceptance })}
            />
            <TextAreaField
              label="Terms text"
              rows={4}
              value={content.termsText}
              maxLength={600}
              onChange={(termsText) => setContent({ termsText })}
            />
          </>
        ) : null}
      </section>

      <hr className="border-line" />

      <section aria-labelledby="support-heading" className="space-y-4">
        <h3 id="support-heading" className="text-sm font-semibold text-fg">
          Support contacts
        </h3>
        <ToggleField
          label="Show support contacts"
          checked={sections.showSupport}
          onChange={(showSupport) => setSections({ showSupport })}
        />
        {sections.showSupport ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Support phone"
              type="tel"
              value={content.supportPhone}
              maxLength={30}
              onChange={(supportPhone) => setContent({ supportPhone })}
            />
            <TextField
              label="Support email"
              type="email"
              value={content.supportEmail}
              maxLength={80}
              onChange={(supportEmail) => setContent({ supportEmail })}
            />
          </div>
        ) : null}
      </section>

      <hr className="border-line" />

      <ToggleField
        label="Show footer"
        checked={sections.showFooter}
        onChange={(showFooter) => setSections({ showFooter })}
      />
    </div>
  );
}
