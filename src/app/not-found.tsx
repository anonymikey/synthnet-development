import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="max-w-sm text-sm text-muted">The page may have moved, or it hasn&apos;t been built yet.</p>
      <Link href="/dashboard" className={buttonStyles("primary", "md")}>
        Go to the dashboard
      </Link>
    </main>
  );
}
