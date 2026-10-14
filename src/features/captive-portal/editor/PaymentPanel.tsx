"use client";

import { Info } from "lucide-react";
import { NumberField, TextAreaField, TextField, ToggleField } from "@/components/ui/form";
import type { PanelProps } from "@/features/captive-portal/editor/types";

export function PaymentPanel({ config, onChange }: PanelProps) {
  const { methods } = config;
  const setMpesa = (patch: Partial<typeof methods.mpesa>) =>
    onChange({ ...config, methods: { ...methods, mpesa: { ...methods.mpesa, ...patch } } });
  const setVoucher = (patch: Partial<typeof methods.voucher>) =>
    onChange({ ...config, methods: { ...methods, voucher: { ...methods.voucher, ...patch } } });
  const setTrial = (patch: Partial<typeof methods.freeTrial>) =>
    onChange({ ...config, methods: { ...methods, freeTrial: { ...methods.freeTrial, ...patch } } });

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          These settings only change how the portal looks. In Phase 1 nothing sends an M-Pesa request, checks a voucher
          or grants network access.
        </span>
      </p>

      <section aria-labelledby="mpesa-heading" className="space-y-4">
        <h3 id="mpesa-heading" className="text-sm font-semibold text-fg">
          M-Pesa payment
        </h3>
        <ToggleField
          label="Offer M-Pesa payment"
          checked={methods.mpesa.enabled}
          onChange={(enabled) => setMpesa({ enabled })}
        />
        {methods.mpesa.enabled ? (
          <>
            <TextField label="Tab label" value={methods.mpesa.label} maxLength={30} onChange={(label) => setMpesa({ label })} />
            <TextAreaField
              label="Instructions"
              value={methods.mpesa.instructions}
              maxLength={240}
              onChange={(instructions) => setMpesa({ instructions })}
            />
            <TextField
              label="Phone number placeholder"
              value={methods.mpesa.phonePlaceholder}
              maxLength={30}
              onChange={(phonePlaceholder) => setMpesa({ phonePlaceholder })}
            />
          </>
        ) : null}
      </section>

      <hr className="border-line" />

      <section aria-labelledby="voucher-heading" className="space-y-4">
        <h3 id="voucher-heading" className="text-sm font-semibold text-fg">
          Vouchers
        </h3>
        <ToggleField
          label="Let people redeem vouchers"
          checked={methods.voucher.enabled}
          onChange={(enabled) => setVoucher({ enabled })}
        />
        {methods.voucher.enabled ? (
          <>
            <TextField label="Tab label" value={methods.voucher.label} maxLength={30} onChange={(label) => setVoucher({ label })} />
            <TextField
              label="Input placeholder"
              value={methods.voucher.placeholder}
              maxLength={40}
              onChange={(placeholder) => setVoucher({ placeholder })}
            />
          </>
        ) : null}
      </section>

      <hr className="border-line" />

      <section aria-labelledby="trial-heading" className="space-y-4">
        <h3 id="trial-heading" className="text-sm font-semibold text-fg">
          Free trial
        </h3>
        <ToggleField
          label="Offer a free trial"
          checked={methods.freeTrial.enabled}
          onChange={(enabled) => setTrial({ enabled })}
        />
        {methods.freeTrial.enabled ? (
          <>
            <TextField label="Tab label" value={methods.freeTrial.label} maxLength={30} onChange={(label) => setTrial({ label })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Trial length (minutes)"
                value={methods.freeTrial.minutes}
                min={1}
                max={1440}
                onChange={(minutes) => setTrial({ minutes: Math.round(minutes) })}
              />
              <NumberField
                label="Trial speed (Mbps)"
                value={methods.freeTrial.speedMbps}
                min={1}
                max={1000}
                onChange={(speedMbps) => setTrial({ speedMbps })}
              />
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
