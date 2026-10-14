"use client";

import { Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";
import { simulateDelay } from "@/lib/utils/simulate";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Frontend-only sign-in mockup. No credentials are checked, sent or stored. */
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter an email address, like admin@yourisp.com.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    await simulateDelay(700);
    toast.push({
      title: "Demo sign-in complete",
      description: "No account was checked. Real sign-in arrives in a later phase.",
      tone: "info",
    });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        error={errors.email}
        onChange={setEmail}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={setPassword}
      />
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
        {busy ? "Signing in" : "Sign in"}
      </Button>
      <p className="flex items-start gap-2 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>Demo sign-in. Any email and an 8+ character password will open the dashboard. Nothing is stored.</span>
      </p>
    </form>
  );
}
