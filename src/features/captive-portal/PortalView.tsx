"use client";

import { CheckCircle2, Gift, Loader2, Mail, Phone, Ticket, Wallet } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { PORTAL_FONT_STACKS, portalBackgroundStyle } from "@/features/captive-portal/portal-theme";
import { readableTextOn } from "@/lib/utils/color";
import { formatData, formatDuration, formatMoney } from "@/lib/utils/format";
import type { PortalConfig, PortalMethodId, PortalPlan } from "@/types/portal";

type Step = "checkout" | "processing" | "success";

interface Summary {
  title: string;
  detail: string;
}

const PHONE_PATTERN = /^(?:\+?254|0)[17]\d{8}$/;
const STATUS_POLL_MS = 5000;
const STATUS_MAX_POLLS = 24;

interface PortalViewProps {
  config: PortalConfig;
  /** Fill the whole viewport (public /portal page) instead of the parent's height. */
  fullPage?: boolean;
}

/**
 * The subscriber-facing captive portal. M-Pesa checkout is sent through the
 * server-side Courtney Tech route so credentials never reach the browser.
 */
export function PortalView({ config, fullPage = false }: PortalViewProps) {
  const { brand, theme, content, methods, sections, plans } = config;
  const uid = useId();

  const [step, setStep] = useState<Step>("checkout");
  const [chosenMethod, setChosenMethod] = useState<PortalMethodId>("mpesa");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [voucher, setVoucher] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pendingLabel, setPendingLabel] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const enabledMethods = useMemo(() => {
    const list: Array<{ id: PortalMethodId; label: string }> = [];
    if (methods.mpesa.enabled) list.push({ id: "mpesa", label: methods.mpesa.label });
    if (methods.voucher.enabled) list.push({ id: "voucher", label: methods.voucher.label });
    if (methods.freeTrial.enabled) list.push({ id: "trial", label: methods.freeTrial.label });
    return list;
  }, [methods]);

  const activeMethod: PortalMethodId | null =
    enabledMethods.find((method) => method.id === chosenMethod)?.id ?? enabledMethods[0]?.id ?? null;

  const selectedPlan: PortalPlan | null =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans.find((plan) => plan.highlighted) ?? plans[0] ?? null;

  const cardRadius = theme.cornerRadius;
  const controlRadius = Math.max(6, Math.round(cardRadius * 0.6));
  const primaryText = readableTextOn(theme.primaryColor);
  const textAlign = theme.align === "center" ? "text-center" : "text-left";
  const headerAlign = theme.align === "center" ? "items-center" : "items-start";

  const controlStyle = {
    border: `1px solid ${theme.cardTextColor}40`,
    backgroundColor: `${theme.cardTextColor}12`,
    borderRadius: controlRadius,
    color: theme.cardTextColor,
  } as const;

  const primaryButtonStyle = {
    backgroundColor: theme.primaryColor,
    color: primaryText,
    borderRadius: controlRadius,
  } as const;

  const termsRequired = sections.showTerms && sections.requireTermsAcceptance;
  const errorColor = readableTextOn(theme.cardColor) === "#0A0D12" ? "#B91C1C" : "#F87171";

  function begin(next: Summary, label: string) {
    setError(null);
    setPendingLabel(label);
    setStep("processing");
    timer.current = window.setTimeout(() => {
      setSummary(next);
      setStep("success");
      timer.current = null;
    }, 2200);
  }

  async function pollPayment(checkoutRequestId: string, next: Summary) {
    for (let attempt = 0; attempt < STATUS_MAX_POLLS; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, STATUS_POLL_MS));
      const response = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error("Unable to check payment status.");
      if (data?.status === "completed") {
        setSummary({ ...next, detail: `${next.detail} · Payment received` });
        setStep("success");
        return;
      }
      if (data?.status === "cancelled" || data?.status === "failed") {
        throw new Error("The M-Pesa payment was not completed.");
      }
    }
    throw new Error("The payment prompt timed out. Check your phone and try again.");
  }

  function cancelPending() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setStep("checkout");
  }

  function startOver() {
    setStep("checkout");
    setSummary(null);
    setError(null);
    setVoucher("");
  }

  function termsBlocked(): boolean {
    if (termsRequired && !accepted) {
      setError("Please accept the terms to continue.");
      return true;
    }
    return false;
  }

  async function submitMpesa(event: FormEvent) {
    event.preventDefault();
    if (!selectedPlan) {
      setError("No plan is available to buy yet.");
      return;
    }
    if (!PHONE_PATTERN.test(phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid Safaricom number, like 0712 345 678.");
      return;
    }
    if (termsBlocked()) return;

    const nextSummary = {
      title: selectedPlan.name,
      detail: `${formatMoney(selectedPlan.price, selectedPlan.currency)} for ${formatDuration(selectedPlan.durationMinutes)}`,
    };
    setError(null);
    setPendingLabel(`Check your phone for the ${methods.mpesa.label} prompt.`);
    setStep("processing");
    try {
      const response = await fetch("/api/payments/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: selectedPlan.price,
          reference: `PLAN-${selectedPlan.id}`,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.checkoutRequestId) throw new Error(data?.error ?? "Unable to start payment.");
      await pollPayment(data.checkoutRequestId, nextSummary);
    } catch (checkoutError) {
      setStep("checkout");
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to complete payment.");
    }
  }

  function submitVoucher(event: FormEvent) {
    event.preventDefault();
    const code = voucher.trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,20}$/.test(code)) {
      setError("Enter the voucher code exactly as printed (6 to 20 letters or numbers).");
      return;
    }
    if (termsBlocked()) return;
    begin({ title: "Voucher accepted", detail: `Code ${code}` }, "Checking your voucher.");
  }

  function submitTrial(event: FormEvent) {
    event.preventDefault();
    if (termsBlocked()) return;
    begin(
      {
        title: methods.freeTrial.label,
        detail: `${formatDuration(methods.freeTrial.minutes)} at ${methods.freeTrial.speedMbps} Mbps`,
      },
      "Starting your trial.",
    );
  }

  const phoneId = `${uid}-phone`;
  const voucherId = `${uid}-voucher`;
  const errorId = `${uid}-error`;

  return (
    <div
      className={`relative flex w-full flex-col ${fullPage ? "min-h-dvh" : "min-h-full"}`}
      style={{
        ...portalBackgroundStyle(theme),
        color: theme.textColor,
        fontFamily: PORTAL_FONT_STACKS[theme.font],
      }}
    >
      <p className="bg-black/75 px-3 py-1.5 text-center text-[11px] leading-snug text-white">
        Secure checkout powered by Courtney Tech. Payment confirmation is checked automatically.
      </p>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
        <header className={`flex flex-col gap-3 ${headerAlign} ${textAlign}`}>
          {brand.logoDataUrl ? (
            // Uploaded logos are data: URLs held in the browser, so next/image can't optimise them.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoDataUrl} alt={`${brand.name} logo`} className="h-12 max-w-[200px] object-contain" />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center text-lg font-bold"
              style={{ backgroundColor: theme.primaryColor, color: primaryText, borderRadius: controlRadius }}
            >
              {brand.logoInitials}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold">{brand.name}</p>
            {brand.tagline ? <p className="text-xs opacity-75">{brand.tagline}</p> : null}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{content.headline}</h1>
            {content.subtitle ? <p className="mt-1.5 text-sm opacity-80">{content.subtitle}</p> : null}
          </div>
        </header>

        <div
          className="p-4 shadow-lg"
          style={{ backgroundColor: theme.cardColor, color: theme.cardTextColor, borderRadius: cardRadius }}
        >
          {step === "processing" ? (
            <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 aria-hidden="true" className="size-8 animate-spin" style={{ color: theme.primaryColor }} />
              <p className="text-sm font-medium">{pendingLabel}</p>
              <p className="text-xs opacity-70">Keep the prompt open on your phone. We&apos;ll confirm it automatically.</p>
              <button
                type="button"
                onClick={cancelPending}
                className="mt-1 px-3 py-1.5 text-sm font-medium underline underline-offset-2"
              >
                Cancel
              </button>
            </div>
          ) : step === "success" && summary ? (
            <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 aria-hidden="true" className="size-10" style={{ color: theme.primaryColor }} />
              <h2 className="text-lg font-bold">{content.successTitle}</h2>
              <p className="text-sm opacity-85">{content.successMessage}</p>
              <div className="w-full px-3 py-2 text-left text-sm" style={controlStyle}>
                <p className="font-semibold">{summary.title}</p>
                <p className="opacity-80">{summary.detail}</p>
              </div>
              <p className="text-xs opacity-70">
                Payment confirmed. Network access will be provisioned by the hotspot service.
              </p>
              <button
                type="button"
                onClick={startOver}
                className="h-10 w-full px-4 text-sm font-semibold"
                style={primaryButtonStyle}
              >
                Start over
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enabledMethods.length === 0 ? (
                <p className="py-4 text-center text-sm opacity-80">
                  No connection methods are turned on. Enable one in the Payment tab of the editor.
                </p>
              ) : null}

              {enabledMethods.length > 1 ? (
                <div className="grid auto-cols-fr grid-flow-col gap-1 p-1" style={controlStyle}>
                  {enabledMethods.map((method) => {
                    const active = method.id === activeMethod;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setChosenMethod(method.id);
                          setError(null);
                        }}
                        className="px-2 py-2 text-sm font-medium"
                        style={{
                          borderRadius: Math.max(4, controlRadius - 4),
                          backgroundColor: active ? theme.primaryColor : "transparent",
                          color: active ? primaryText : theme.cardTextColor,
                        }}
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {activeMethod === "mpesa" ? (
                <form onSubmit={submitMpesa} noValidate className="space-y-4">
                  {sections.showPlans ? (
                    <fieldset className="space-y-2">
                      <legend className="mb-1 text-sm font-semibold">{content.plansTitle}</legend>
                      {plans.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm opacity-75" style={controlStyle}>
                          No plans yet. Add one in the Plans tab of the editor.
                        </p>
                      ) : (
                        plans.map((plan) => {
                          const checked = selectedPlan?.id === plan.id;
                          return (
                            <label
                              key={plan.id}
                              className="relative flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                              style={{
                                ...controlStyle,
                                borderColor: checked ? theme.primaryColor : `${theme.cardTextColor}40`,
                                boxShadow: checked ? `0 0 0 1px ${theme.primaryColor}` : "none",
                                outlineColor: theme.primaryColor,
                              }}
                            >
                              <input
                                type="radio"
                                name={`${uid}-plan`}
                                value={plan.id}
                                checked={checked}
                                onChange={() => setSelectedPlanId(plan.id)}
                                className="sr-only"
                              />
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                  {plan.name}
                                  {plan.highlighted ? (
                                    <span
                                      className="px-1.5 py-0.5 text-[10px] font-semibold"
                                      style={{
                                        backgroundColor: theme.primaryColor,
                                        color: primaryText,
                                        borderRadius: 999,
                                      }}
                                    >
                                      Most popular
                                    </span>
                                  ) : null}
                                </span>
                                {plan.description ? (
                                  <span className="block text-xs opacity-75">{plan.description}</span>
                                ) : null}
                                <span className="block text-xs opacity-75">
                                  {formatDuration(plan.durationMinutes)} · {plan.speedMbps} Mbps ·{" "}
                                  {formatData(plan.dataCapMb)}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-bold">
                                {formatMoney(plan.price, plan.currency)}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </fieldset>
                  ) : null}

                  <div className="space-y-1.5">
                    <label htmlFor={phoneId} className="text-sm font-semibold">
                      {methods.mpesa.label} phone number
                    </label>
                    {methods.mpesa.instructions ? (
                      <p className="text-xs opacity-75">{methods.mpesa.instructions}</p>
                    ) : null}
                    <div className="relative">
                      <Phone
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-60"
                      />
                      <input
                        id={phoneId}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        placeholder={methods.mpesa.phonePlaceholder}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => {
                          setPhone(event.target.value);
                          setError(null);
                        }}
                        className="h-11 w-full pl-9 pr-3 text-sm placeholder:opacity-50"
                        style={controlStyle}
                      />
                    </div>
                  </div>

                  {renderTerms()}
                  {renderError()}

                  <button
                    type="submit"
                    disabled={plans.length === 0}
                    className="flex h-11 w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:opacity-50"
                    style={primaryButtonStyle}
                  >
                    <Wallet aria-hidden="true" className="size-4" />
                    {content.payButtonLabel}
                    {selectedPlan ? ` · ${formatMoney(selectedPlan.price, selectedPlan.currency)}` : ""}
                  </button>
                </form>
              ) : null}

              {activeMethod === "voucher" ? (
                <form onSubmit={submitVoucher} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor={voucherId} className="text-sm font-semibold">
                      {methods.voucher.label} code
                    </label>
                    <div className="relative">
                      <Ticket
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-60"
                      />
                      <input
                        id={voucherId}
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        value={voucher}
                        placeholder={methods.voucher.placeholder}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => {
                          setVoucher(event.target.value);
                          setError(null);
                        }}
                        className="h-11 w-full pl-9 pr-3 text-sm uppercase placeholder:normal-case placeholder:opacity-50"
                        style={controlStyle}
                      />
                    </div>
                  </div>
                  {renderTerms()}
                  {renderError()}
                  <button
                    type="submit"
                    className="h-11 w-full px-4 text-sm font-semibold"
                    style={primaryButtonStyle}
                  >
                    {content.voucherButtonLabel}
                  </button>
                </form>
              ) : null}

              {activeMethod === "trial" ? (
                <form onSubmit={submitTrial} noValidate className="space-y-4">
                  <p className="flex items-start gap-2 text-sm">
                    <Gift aria-hidden="true" className="mt-0.5 size-4 shrink-0" style={{ color: theme.primaryColor }} />
                    <span>
                      Try the connection for {formatDuration(methods.freeTrial.minutes)} at{" "}
                      {methods.freeTrial.speedMbps} Mbps. No payment needed.
                    </span>
                  </p>
                  {renderTerms()}
                  {renderError()}
                  <button
                    type="submit"
                    className="h-11 w-full px-4 text-sm font-semibold"
                    style={primaryButtonStyle}
                  >
                    {content.trialButtonLabel}
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </div>

        <div className={`space-y-3 text-xs ${textAlign}`}>
          {sections.showTerms && content.termsText ? <p className="opacity-75">{content.termsText}</p> : null}
          {sections.showSupport && (content.supportPhone || content.supportEmail) ? (
            <p className={`flex flex-wrap gap-x-4 gap-y-1 ${theme.align === "center" ? "justify-center" : ""}`}>
              {content.supportPhone ? (
                <a
                  href={`tel:${content.supportPhone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-1.5 underline underline-offset-2"
                >
                  <Phone aria-hidden="true" className="size-3.5" />
                  {content.supportPhone}
                </a>
              ) : null}
              {content.supportEmail ? (
                <a
                  href={`mailto:${content.supportEmail}`}
                  className="inline-flex items-center gap-1.5 underline underline-offset-2"
                >
                  <Mail aria-hidden="true" className="size-3.5" />
                  {content.supportEmail}
                </a>
              ) : null}
            </p>
          ) : null}
          {sections.showFooter && content.footerText ? <p className="opacity-60">{content.footerText}</p> : null}
        </div>
      </div>
    </div>
  );

  function renderTerms(): ReactNode {
    if (!termsRequired) return null;
    return (
      <label className="flex cursor-pointer items-start gap-2 text-xs">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => {
            setAccepted(event.target.checked);
            setError(null);
          }}
          className="mt-0.5 size-4 shrink-0"
          style={{ accentColor: theme.primaryColor }}
        />
        <span>I accept the terms of use shown below.</span>
      </label>
    );
  }

  function renderError(): ReactNode {
    if (!error) return null;
    return (
      <p id={errorId} role="alert" className="text-xs font-medium" style={{ color: errorColor }}>
        {error}
      </p>
    );
  }
}
