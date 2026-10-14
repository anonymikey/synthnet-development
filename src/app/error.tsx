"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong on this page</h1>
      <p className="max-w-sm text-sm text-muted">Try again. If it keeps happening, reload the page.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
