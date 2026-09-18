"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Laptop,
  Search,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrands, getModels, countForModel } from "@/lib/api";
import type { DeviceModel, DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── device type config ────────────────────────────────────────────────────
const DEVICE_TYPES = [
  {
    id: "phone"  as DeviceType,
    label: "Phone Skins",
    sublabel: "700+ designs · all models",
    icon: Smartphone,
    href: "/devices/phones",
  },
  {
    id: "tablet" as DeviceType,
    label: "Tablet Skins",
    sublabel: "iPad, Galaxy Tab & more",
    icon: Tablet,
    href: "/devices/tablets",
  },
  {
    id: "laptop" as DeviceType,
    label: "Laptop Skins",
    sublabel: "MacBook, Dell, HP & more",
    icon: Laptop,
    href: "/devices/laptops",
  },
] as const;

// ─── sub-components ────────────────────────────────────────────────────────

function SelectBox({
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border bg-white/80 px-4 py-3 pr-10",
          "text-sm font-medium text-foreground shadow-sm",
          "backdrop-blur-sm transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
          "hover:border-foreground/30 hover:bg-white/95",
          "disabled:cursor-not-allowed disabled:opacity-50",
          value === "" && "text-muted-foreground"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export function DeviceFinder({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  // search-first state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  // all brands + models (unfiltered for search, filtered for dropdowns)
  const allModels = useMemo(() => getModels(), []);
  const allBrands = useMemo(() => getBrands(), []);

  // search results — match name or brand name
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allModels
      .filter((m) => {
        const brand = allBrands.find((b) => b.id === m.brandId);
        return (
          m.name.toLowerCase().includes(q) ||
          brand?.name.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchQuery, allModels, allBrands]);

  // dropdown flow
  const brandOptions = useMemo(
    () => allBrands.map((b) => ({ value: b.id, label: b.name })),
    [allBrands]
  );

  const modelOptions = useMemo(() => {
    if (!selectedBrandId) return [];
    return getModels({ brandId: selectedBrandId }).map((m) => ({
      value: m.id,
      label: m.name,
    }));
  }, [selectedBrandId]);

  const selectedModel: DeviceModel | undefined = useMemo(
    () => allModels.find((m) => m.id === selectedModelId),
    [selectedModelId, allModels]
  );

  const selectedBrand = allBrands.find((b) => b.id === selectedBrandId);
  const count = selectedModel ? countForModel(selectedModel) : 0;

  function goToModel(m: DeviceModel) {
    const brand = allBrands.find((b) => b.id === m.brandId);
    if (brand) router.push(`/devices/${brand.slug}/${m.slug}`);
  }

  function handleGo() {
    if (selectedModel && selectedBrand) {
      router.push(`/devices/${selectedBrand.slug}/${selectedModel.slug}`);
    }
  }

  const showSearch = searchQuery.trim().length >= 2;
  const canGo = Boolean(selectedModel);

  return (
    <div
      className={cn(
        "glass-lg shadow-glass rounded-2xl overflow-hidden",
        !compact && "shadow-[0_8px_48px_rgba(0,65,200,0.08)]"
      )}
    >
      {/* ── Header band ── */}
      <div
        className="border-b border-white/10 px-6 py-5 sm:px-8"
        style={{
          background:
            "linear-gradient(135deg, #0a1628 0%, #0d1f4a 50%, #0f2460 100%)",
        }}
      >
        <p className="text-label-sm text-electric/80">Device finder</p>
        <h3 className="mt-1 text-headline-lg text-white">Find your device</h3>
        <p className="mt-1 text-sm text-white/45">
          1,200+ models, precision-cut in India.
        </p>
      </div>

      <div className={cn("px-6 py-6", !compact && "sm:px-8 sm:py-8")}>

        {/* ── Search bar ── */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your model — e.g. iPhone 16 Pro, Galaxy S26…"
            className="h-12 rounded-xl border-border/60 bg-white/80 pl-11 text-sm shadow-sm backdrop-blur-sm placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            aria-label="Search device model"
          />
        </div>

        {/* ── Live search results ── */}
        {showSearch && (
          <ul className="mt-2 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-white/90 shadow-glass backdrop-blur-sm">
            {searchResults.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No models found for &ldquo;{searchQuery}&rdquo;
              </li>
            ) : (
              searchResults.map((m) => {
                const brand = allBrands.find((b) => b.id === m.brandId);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => goToModel(m)}
                      className="press flex w-full items-center justify-between px-4 py-3 text-left hover:bg-primary/5"
                    >
                      <span>
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground capitalize">
                          {brand?.name} · {m.type}
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-primary opacity-60" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}

        {/* ── Divider ── */}
        {!showSearch && (
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground">
              or choose from dropdowns
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </div>
        )}

        {/* ── Dropdown row ── */}
        {!showSearch && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SelectBox
                value={selectedBrandId}
                onChange={(v) => {
                  setSelectedBrandId(v);
                  setSelectedModelId("");
                }}
                placeholder="Choose brand"
                options={brandOptions}
              />
            </div>
            <div className="flex-1">
              <SelectBox
                value={selectedModelId}
                onChange={setSelectedModelId}
                placeholder="Choose model"
                options={modelOptions}
                disabled={!selectedBrandId}
              />
            </div>
            <Button
              onClick={handleGo}
              disabled={!canGo}
              size="lg"
              className={cn(
                "h-11 min-w-[80px] rounded-xl px-6 text-sm font-semibold transition-all duration-200",
                canGo
                  ? "bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(0,65,200,0.3)] hover:shadow-[0_6px_20px_rgba(0,65,200,0.4)]"
                  : "bg-muted text-muted-foreground"
              )}
            >
              Go
            </Button>
          </div>
        )}

        {/* Helper hint */}
        {!showSearch && (
          <p className="mt-3 text-center text-xs text-muted-foreground/70">
            Pick a brand first, then choose your model.
          </p>
        )}

        {/* ── Skin count feedback ── */}
        {selectedModel && !showSearch && (
          <div className="animate-rise mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-electric-soft/60 px-4 py-3 backdrop-blur-sm">
            <div>
              <p className="text-xs text-muted-foreground">Selected model</p>
              <p className="text-sm font-semibold tracking-tight">
                {selectedModel.name}
              </p>
              <p className="mt-0.5 text-xs font-medium text-primary">
                {count} compatible skins
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleGo}
              className="shrink-0 gap-1.5"
            >
              Browse Skins <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {/* ── Device not listed? ── */}
        <div className="mt-8 border-t border-border/60 pt-6">
          <div className="mb-4 flex flex-col items-center gap-1 text-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Device not listed?
            </span>
            <p className="mt-2 text-sm font-semibold text-foreground">
              Shop by design instead
            </p>
            <p className="text-xs text-muted-foreground">
              Pick the design you love, then choose your model at checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DEVICE_TYPES.map(({ id, label, sublabel, icon: Icon, href }) => (
              <a
                key={id}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-4 transition-all duration-200",
                  "glass-sm shadow-glass hover:shadow-glass-hover hover:border-primary/30",
                  "hover:-translate-y-0.5"
                )}
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                    "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-tight">
                    {label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {sublabel}
                  </span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
