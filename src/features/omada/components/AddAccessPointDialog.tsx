"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/form";
import { OMADA_AP_CATALOG } from "@/features/omada/omada.catalog";
import { isValidIpv4 } from "@/features/omada/omada.logic";

export interface NewApInput {
  name: string;
  modelId: string;
  ipAddress: string;
}

interface AddAccessPointDialogProps {
  open: boolean;
  existingNames: readonly string[];
  onSubmit: (input: NewApInput) => void;
  onCancel: () => void;
}

const MODEL_OPTIONS = OMADA_AP_CATALOG.map((model) => ({ value: model.id, label: `${model.displayName} (${model.speedClass})` }));
const DEFAULT_MODEL = OMADA_AP_CATALOG[0]?.id ?? "";

/** Adds an access point to the in-browser demo site only. Nothing is adopted or configured. */
export function AddAccessPointDialog({ open, existingNames, onSubmit, onCancel }: AddAccessPointDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setName("");
      setModelId(DEFAULT_MODEL);
      setAddress("");
      setErrors({});
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: { name?: string; address?: string } = {};
    const trimmed = name.trim();
    if (trimmed.length < 3) next.name = "Use at least 3 characters.";
    else if (existingNames.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      next.name = "An access point with this name already exists.";
    }
    if (address.trim() !== "" && !isValidIpv4(address)) next.address = "Enter an IPv4 address, like 192.168.20.5.";
    setErrors(next);
    if (next.name || next.address) return;
    onSubmit({ name: trimmed, modelId, ipAddress: address.trim() });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-ap-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-raised p-0 text-fg shadow-pop backdrop:bg-black/60"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
        <div>
          <h2 id="add-ap-title" className="text-lg font-semibold">
            Add a demo access point
          </h2>
          <p className="mt-1 text-sm text-muted">
            This only adds a card to the demo site in your browser. No access point is adopted or configured.
          </p>
        </div>
        <TextField label="Access point name" value={name} error={errors.name} maxLength={32} onChange={setName} />
        <SelectField label="Model" value={modelId} options={MODEL_OPTIONS} onChange={setModelId} />
        <TextField
          label="IP address (optional)"
          value={address}
          error={errors.address}
          placeholder="192.168.20.5"
          onChange={setAddress}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add access point</Button>
        </div>
      </form>
    </dialog>
  );
}
