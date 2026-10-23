"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type DeviceKind, type PickerModel } from "@/lib/live-devices";
import { useDeviceCatalog } from "@/lib/stores/device-catalog-store";
import { cn } from "@/lib/utils";

const TABS = [
  ["phone", "Phone"],
  ["laptop", "Laptop"],
] as const;

export function DevicePicker({
  value,
  onConfirm,
}: {
  value?: PickerModel;
  onConfirm: (model: PickerModel) => void;
}) {
  const [kind, setKind] = useState<DeviceKind>(value?.kind ?? "phone");
  const [brandId, setBrandId] = useState<string | null>(value?.brandId ?? null);
  const [query, setQuery] = useState("");

  const brands = useDeviceCatalog((s) => s.brands);
  const models = useDeviceCatalog((s) => s.models);
  const loadCatalog = useDeviceCatalog((s) => s.load);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const visibleBrands = useMemo(
    () => brands.filter((b) => models.some((m) => m.brandId === b.id && m.kind === kind)),
    [brands, models, kind]
  );

  const visibleModels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return models.filter(
      (m) =>
        m.kind === kind &&
        (brandId == null || m.brandId === brandId) &&
        (!q || m.name.toLowerCase().includes(q))
    );
  }, [models, kind, brandId, query]);

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
        {TABS.map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={kind === t}
            onClick={() => {
              setKind(t);
              setBrandId(null);
            }}
            className={`press rounded-lg px-5 py-2.5 text-sm font-semibold ${
              kind === t
                ? "bg-foreground text-background"
                : "border hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {visibleBrands.map((b) => (
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

      {visibleModels.length === 0 && brandId == null ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pick a brand above to see models.
        </p>
      ) : visibleModels.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No models match “{query}”.
        </p>
      ) : (
        <ul className="mt-6 grid max-h-[46vh] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {visibleModels.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onConfirm(m)}
                className="press flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3.5 text-left hover:border-transparent hover:shadow-card-hover"
              >
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                    {m.brandName}
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
