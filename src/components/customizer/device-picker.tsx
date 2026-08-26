"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBrands, getModels } from "@/lib/api";
import type { DeviceModel, DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DevicePicker({
  value,
  onConfirm,
}: {
  value?: DeviceModel;
  onConfirm: (model: DeviceModel) => void;
}) {
  const [type, setType] = useState<DeviceType>(value?.type ?? "phone");
  const [brandId, setBrandId] = useState<string | null>(value?.brandId ?? null);
  const [query, setQuery] = useState("");

  const brands = useMemo(() => getBrands(type), [type]);
  const models = useMemo(
    () =>
      getModels({ type, brandId: brandId ?? undefined }).filter((m) =>
        m.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [type, brandId, query]
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <p className="text-label-sm text-primary">Step 1 of 3</p>
        <h1 className="mt-2 text-headline-lg">Select your device</h1>
        <p className="mt-2 text-muted-foreground">
          Your design will be cut exactly for this model.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Device family">
        {(
          [
            ["phone", "Phone"],
            ["laptop", "Laptop"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={type === t}
            onClick={() => {
              setType(t);
              setBrandId(null);
            }}
            className={`press rounded-lg px-5 py-2.5 text-sm font-semibold ${
              type === t
                ? "bg-foreground text-background"
                : "border hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {brands.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              aria-pressed={brandId === b.id}
              onClick={() => setBrandId(b.id === brandId ? null : b.id)}
              className={cn(
                "press rounded-lg border px-3.5 py-2 text-sm font-medium",
                brandId === b.id
                  ? "border-transparent ring-2 ring-primary"
                  : "hover:bg-muted"
              )}
            >
              {b.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="relative mx-auto mt-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models…"
          className="h-11 pl-9"
          aria-label="Search models"
        />
      </div>

      {models.length === 0 && brandId == null ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pick a brand above to see models.
        </p>
      ) : models.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No models match “{query}”.
        </p>
      ) : (
        <ul className="mt-6 grid max-h-[46vh] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {models.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onConfirm(m)}
                className="press flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left hover:border-transparent hover:shadow-card-hover"
              >
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                    {getBrands(type).find((b) => b.id === m.brandId)?.name}
                  </span>
                  <span className="block font-medium">{m.name}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Device missing? New templates ship monthly —{" "}
        <Button variant="link" className="h-auto p-0 text-xs" asChild>
          <a href="mailto:support@phonex.in?subject=Request%20a%20device">request yours</a>
        </Button>
        .
      </p>
    </div>
  );
}
