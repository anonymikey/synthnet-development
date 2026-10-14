"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/form";
import { MIKROTIK_CATALOG } from "@/features/mikrotik/mikrotik.catalog";
import { isValidIpv4 } from "@/features/mikrotik/mikrotik.logic";

export interface NewRouterInput {
  name: string;
  modelId: string;
  managementAddress: string;
}

interface AddRouterDialogProps {
  open: boolean;
  existingNames: readonly string[];
  onSubmit: (input: NewRouterInput) => void;
  onCancel: () => void;
}

const MODEL_OPTIONS = MIKROTIK_CATALOG.map((model) => ({ value: model.id, label: model.displayName }));
const DEFAULT_MODEL = MIKROTIK_CATALOG[0]?.id ?? "";

/** Adds a router to the in-browser demo inventory only. Nothing is contacted or configured. */
export function AddRouterDialog({ open, existingNames, onSubmit, onCancel }: AddRouterDialogProps) {
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
      next.name = "A router with this name already exists.";
    }
    if (address.trim() !== "" && !isValidIpv4(address)) next.address = "Enter an IPv4 address, like 10.10.10.1.";
    setErrors(next);
    if (next.name || next.address) return;
    onSubmit({ name: trimmed, modelId, managementAddress: address.trim() });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-router-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-raised p-0 text-fg shadow-pop backdrop:bg-black/60"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
        <div>
          <h2 id="add-router-title" className="text-lg font-semibold">
            Add a demo router
          </h2>
          <p className="mt-1 text-sm text-muted">
            This only adds a card to the demo inventory in your browser. No router is contacted or configured.
          </p>
        </div>
        <TextField label="Router name" value={name} error={errors.name} maxLength={32} onChange={setName} />
        <SelectField label="Model" value={modelId} options={MODEL_OPTIONS} onChange={setModelId} />
        <TextField
          label="Management address (optional)"
          value={address}
          error={errors.address}
          placeholder="10.10.10.1"
          onChange={setAddress}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add router</Button>
        </div>
      </form>
    </dialog>
  );
}
