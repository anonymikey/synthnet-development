"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.push({
        title: "Couldn't copy",
        description: "Your browser blocked clipboard access. Select the text and copy it by hand.",
        tone: "warning",
      });
    }
  }

  return (
    <Button variant="ghost" size="sm" aria-label={`Copy ${label}`} onClick={copy}>
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
