import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Sign in to SYNTHNET</h1>
          <p className="mt-1 text-sm text-muted">Manage subscribers, payments and your network from one place.</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-6 shadow-card">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
