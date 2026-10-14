"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { isHexColor } from "@/lib/utils/color";

const inputClass =
  "w-full rounded-md border border-line bg-ink px-3 text-sm text-fg placeholder:text-muted/70 focus-visible:border-accent disabled:opacity-50";

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface ShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, children }: ShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "email" | "password" | "tel";
  autoComplete?: string;
  disabled?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  maxLength,
  type = "text",
  autoComplete,
  disabled,
}: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "h-10")}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  maxLength?: number;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, hint, maxLength, rows = 3 }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={describedBy(id, hint)}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "resize-y py-2")}
      />
    </FieldShell>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
}

export function NumberField({ label, value, onChange, min, max, step = 1, hint }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setText(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  }

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        step={step}
        aria-describedby={describedBy(id, hint)}
        onChange={handleChange}
        onBlur={() => setText(String(value))}
        className={cn(inputClass, "h-10")}
      />
    </FieldShell>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const id = useId();
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const invalid = !isHexColor(text);

  return (
    <FieldShell id={id} label={label} error={invalid ? "Use a 6-digit hex colour, like #22D3C5." : undefined}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          aria-label={`${label} colour picker`}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-line bg-ink p-1"
        />
        <input
          id={id}
          type="text"
          value={text}
          maxLength={7}
          spellCheck={false}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            if (isHexColor(next)) onChange(next.toUpperCase());
          }}
          onBlur={() => setText(value)}
          className={cn(inputClass, "h-10 font-mono uppercase")}
        />
      </div>
    </FieldShell>
  );
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <span id={`${id}-label`} className="text-sm font-medium text-fg">
          {label}
        </span>
        {description ? (
          <p id={`${id}-description`} className="mt-0.5 text-xs text-muted">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent bg-accent" : "border-line bg-raised",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-px top-px h-5 w-5 rounded-full transition-transform",
            checked ? "translate-x-5 bg-accent-ink" : "translate-x-0 bg-muted",
          )}
        />
      </button>
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
}

export function SelectField<T extends string>({ label, value, options, onChange, hint }: SelectFieldProps<T>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select
        id={id}
        value={value}
        aria-describedby={describedBy(id, hint)}
        onChange={(event) => {
          const match = options.find((option) => option.value === event.target.value);
          if (match) onChange(match.value);
        }}
        className={cn(inputClass, "h-10")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function RangeField({ label, value, min, max, unit = "", onChange }: RangeFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <span className="text-xs text-muted">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[rgb(var(--c-accent))]"
      />
    </div>
  );
}

interface FileFieldProps {
  label: string;
  accept: string;
  maxBytes: number;
  previewSrc: string | null;
  hint?: string;
  onLoad: (dataUrl: string) => void;
  onClear: () => void;
  onError: (message: string) => void;
}

export function FileField({ label, accept, maxBytes, previewSrc, hint, onLoad, onClear, onError }: FileFieldProps) {
  const id = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("That file isn't an image. Choose a PNG, JPG, WebP or SVG file.");
      return;
    }
    if (file.size > maxBytes) {
      onError(`That image is too large. The maximum size is ${Math.round(maxBytes / 1024)} KB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLoad(reader.result);
      else onError("Couldn't read that image. Try a different file.");
    };
    reader.onerror = () => onError("Couldn't read that image. Try a different file.");
    reader.readAsDataURL(file);
  }

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <div className="flex items-center gap-3">
        {previewSrc ? (
          // Uploaded images are data: URLs held in the browser, so next/image can't optimise them.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="h-10 w-10 shrink-0 rounded-md border border-line object-cover" />
        ) : null}
        <label
          htmlFor={id}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-raised px-3 text-sm font-medium text-fg hover:bg-line/60 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
        >
          <Upload aria-hidden="true" className="size-4" />
          {previewSrc ? "Replace image" : "Upload image"}
          <input id={id} type="file" accept={accept} onChange={handleChange} className="sr-only" />
        </label>
        {previewSrc ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X aria-hidden="true" className="size-4" />
            Remove
          </Button>
        ) : null}
      </div>
    </FieldShell>
  );
}
