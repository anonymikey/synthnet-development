"use client";

import {
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  Smartphone,
  Tag,
  Type,
  Undo2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs, panelId, tabId, type TabItem } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { BrandPanel } from "@/features/captive-portal/editor/BrandPanel";
import { ContentPanel } from "@/features/captive-portal/editor/ContentPanel";
import { LegalPanel } from "@/features/captive-portal/editor/LegalPanel";
import { LookPanel } from "@/features/captive-portal/editor/LookPanel";
import { PaymentPanel } from "@/features/captive-portal/editor/PaymentPanel";
import { PlansPanel } from "@/features/captive-portal/editor/PlansPanel";
import { PhoneFrame } from "@/features/captive-portal/PhoneFrame";
import { PortalView } from "@/features/captive-portal/PortalView";
import {
  clearSavedPortalConfig,
  getDefaultPortalConfig,
  isRecord,
  loadPortalConfig,
  sanitizePortalConfig,
  savePortalConfig,
} from "@/lib/mock-services/portal-storage";
import { cn } from "@/lib/utils/cn";
import type { PortalConfig } from "@/types/portal";

type PanelId = "brand" | "look" | "content" | "plans" | "payment" | "legal";
type PreviewDevice = "phone" | "desktop";

const TABS: readonly TabItem<PanelId>[] = [
  { id: "brand", label: "Brand", icon: Tag },
  { id: "look", label: "Look", icon: Palette },
  { id: "content", label: "Text", icon: Type },
  { id: "plans", label: "Plans", icon: Layers },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "legal", label: "Legal & support", icon: FileText },
];

const ID_PREFIX = "portal-editor";
const IMPORT_MAX_BYTES = 2 * 1024 * 1024;

export function PortalEditor() {
  const toast = useToast();
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<PortalConfig>(() => getDefaultPortalConfig());
  const [draft, setDraft] = useState<PortalConfig>(() => getDefaultPortalConfig());
  const [tab, setTab] = useState<PanelId>("brand");
  const [device, setDevice] = useState<PreviewDevice>("phone");
  const [previewKey, setPreviewKey] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadPortalConfig();
    setSaved(loaded);
    setDraft(loaded);
    setReady(true);
  }, []);

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function showImageError(message: string) {
    toast.push({ title: "Image not added", description: message, tone: "danger" });
  }

  function handleSave() {
    if (savePortalConfig(draft)) {
      setSaved(draft);
      toast.push({
        title: "Portal saved",
        description: "Saved in this browser only. The live portal page now shows these changes.",
        tone: "success",
      });
    } else {
      toast.push({
        title: "Couldn't save the portal",
        description: "Browser storage is full or blocked. Try a smaller logo or background image.",
        tone: "danger",
      });
    }
  }

  function handleDiscard() {
    setDraft(saved);
    toast.push({ title: "Changes discarded", description: "The editor is back to the last saved version.", tone: "info" });
  }

  function handleReset() {
    clearSavedPortalConfig();
    const defaults = getDefaultPortalConfig();
    setSaved(defaults);
    setDraft(defaults);
    setConfirmReset(false);
    toast.push({ title: "Portal reset", description: "The default demo portal is back.", tone: "info" });
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "synthnet-portal-config.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.push({ title: "Config exported", description: "Saved as synthnet-portal-config.json.", tone: "success" });
  }

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > IMPORT_MAX_BYTES) {
      toast.push({ title: "File too large", description: "Config files must be under 2 MB.", tone: "danger" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(typeof reader.result === "string" ? reader.result : "");
        if (!isRecord(parsed) || parsed.version !== 1) {
          toast.push({
            title: "Not a portal config",
            description: "That file isn't a SYNTHNET portal config (version 1).",
            tone: "danger",
          });
          return;
        }
        setDraft(sanitizePortalConfig(parsed));
        toast.push({
          title: "Config imported",
          description: "Review the preview, then choose Save changes to keep it.",
          tone: "success",
        });
      } catch {
        toast.push({ title: "Couldn't read that file", description: "It isn't valid JSON.", tone: "danger" });
      }
    };
    reader.onerror = () =>
      toast.push({ title: "Couldn't read that file", description: "Try choosing it again.", tone: "danger" });
    reader.readAsText(file);
  }

  function renderPanel() {
    switch (tab) {
      case "brand":
        return <BrandPanel config={draft} onChange={setDraft} onError={showImageError} />;
      case "look":
        return <LookPanel config={draft} onChange={setDraft} onError={showImageError} />;
      case "content":
        return <ContentPanel config={draft} onChange={setDraft} />;
      case "plans":
        return <PlansPanel config={draft} onChange={setDraft} />;
      case "payment":
        return <PaymentPanel config={draft} onChange={setDraft} />;
      case "legal":
        return <LegalPanel config={draft} onChange={setDraft} />;
    }
  }

  if (!ready) {
    return (
      <div role="status" aria-busy="true" className="h-96 animate-pulse rounded-lg border border-line bg-surface">
        <span className="sr-only">Loading the portal editor</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {dirty ? <Badge tone="warning">Unsaved changes</Badge> : <Badge tone="success">All changes saved</Badge>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDiscard} disabled={!dirty}>
            <Undo2 aria-hidden="true" className="size-4" />
            Discard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => importRef.current?.click()}>
            <Upload aria-hidden="true" className="size-4" />
            Import
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="sr-only"
            tabIndex={-1}
            aria-label="Import portal config file"
          />
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download aria-hidden="true" className="size-4" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Button>
          <Link href="/portal" target="_blank" rel="noreferrer" className={buttonStyles("secondary", "sm")}>
            <ExternalLink aria-hidden="true" className="size-4" />
            Open live portal
          </Link>
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            <Save aria-hidden="true" className="size-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <Card className="min-w-0">
          <div className="px-5 pt-2">
            <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix={ID_PREFIX} label="Portal settings" />
          </div>
          <div
            role="tabpanel"
            id={panelId(ID_PREFIX, tab)}
            aria-labelledby={tabId(ID_PREFIX, tab)}
            tabIndex={0}
            className="p-5"
          >
            {renderPanel()}
          </div>
        </Card>

        <div className="min-w-0 space-y-3 xl:sticky xl:top-20 xl:self-start">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-fg">Live preview</h2>
            <div role="group" aria-label="Preview size" className="flex rounded-md border border-line bg-raised p-0.5">
              {(
                [
                  { id: "phone", label: "Phone", icon: Smartphone },
                  { id: "desktop", label: "Wide", icon: Monitor },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={device === option.id}
                  onClick={() => setDevice(option.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium",
                    device === option.id ? "bg-line text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <option.icon aria-hidden="true" className="size-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {device === "phone" ? (
            <PhoneFrame label="Portal preview at phone size">
              <PortalView key={previewKey} config={draft} />
            </PhoneFrame>
          ) : (
            <div
              role="group"
              aria-label="Portal preview at wide size"
              className="h-[640px] overflow-y-auto rounded-lg border border-line"
            >
              <PortalView key={previewKey} config={draft} />
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              The preview is interactive but simulated. Nothing is paid or connected.
            </p>
            <Button variant="ghost" size="sm" onClick={() => setPreviewKey((key) => key + 1)}>
              Restart preview
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-fg">How this reaches your routers</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          In Phase 1 the portal is a standalone page at <span className="font-mono text-fg">/portal</span>. Sending
          hotspot users to it from MikroTik or Omada is a Phase 2 task. It will be reviewed separately so the existing
          MikroTik hotspot login keeps working exactly as it does today.
        </p>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset the portal to defaults?"
        description="This clears your saved portal and unsaved edits in this browser, then restores the default demo portal."
        confirmLabel="Reset portal"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
