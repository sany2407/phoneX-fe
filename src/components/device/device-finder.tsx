"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
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

// ─── GlassSelect ─────────────────────────────────────────────────────────────
//
// Custom dropdown with glassmorphism — replaces the native <select> so we
// control every pixel of the open panel.

function GlassSelect({
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
  const [open,        setOpen]        = useState(false);
  const [filter,      setFilter]      = useState("");
  const containerRef  = useRef<HTMLDivElement>(null);
  const searchRef     = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  // Filter options by the inline search
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, filter]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setFilter("");
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setFilter(""); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3",
          "text-sm font-medium transition-all duration-200",
          // glass base
          "border border-white/60 bg-white/70 backdrop-blur-md",
          "shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]",
          // hover
          "hover:bg-white/90 hover:border-primary/30",
          "hover:shadow-[0_4px_20px_rgba(0,65,200,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
          // open
          open && "border-primary/40 bg-white/90 ring-2 ring-primary/20",
          // disabled
          disabled && "cursor-not-allowed opacity-50",
          // placeholder vs selected colour
          !selected ? "text-muted-foreground/70" : "text-foreground"
        )}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-primary"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-50",
            "rounded-2xl overflow-hidden",
            // glass panel
            "border border-white/70 bg-white/80 backdrop-blur-xl",
            "shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]",
          )}
          role="listbox"
        >
          {/* Inline search — shown when >6 options */}
          {options.length > 6 && (
            <div className="border-b border-white/60 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  ref={searchRef}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search…"
                  className={cn(
                    "w-full rounded-lg py-2 pl-8 pr-3 text-xs",
                    "bg-white/60 backdrop-blur-sm border border-white/50",
                    "placeholder:text-muted-foreground/50 text-foreground",
                    "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40",
                  )}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <ul className="max-h-56 overflow-y-auto py-1.5">
            {visible.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-muted-foreground">
                No results
              </li>
            ) : (
              visible.map((o) => {
                const isSelected = o.value === value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                        setFilter("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-sm",
                        "transition-colors duration-100",
                        isSelected
                          ? "bg-primary/8 font-semibold text-primary"
                          : "text-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {isSelected && (
                        <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export function DeviceFinder({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  const [searchQuery,     setSearchQuery]     = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  const allModels = useMemo(() => getModels(), []);
  const allBrands = useMemo(() => getBrands(), []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allModels
      .filter((m) => {
        const brand = allBrands.find((b) => b.id === m.brandId);
        return m.name.toLowerCase().includes(q) || brand?.name.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [searchQuery, allModels, allBrands]);

  const brandOptions = useMemo(
    () => allBrands.map((b) => ({ value: b.id, label: b.name })),
    [allBrands]
  );

  const modelOptions = useMemo(() => {
    if (!selectedBrandId) return [];
    return getModels({ brandId: selectedBrandId }).map((m) => ({ value: m.id, label: m.name }));
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
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f4a 50%, #0f2460 100%)",
        }}
      >
        <p className="text-label-sm text-electric/80">Device finder</p>
        <h3 className="mt-1 text-headline-lg text-white">Find your device</h3>
        <p className="mt-1 text-sm text-white/45">1,200+ models, precision-cut in India.</p>
      </div>

      <div className={cn("px-6 py-6", !compact && "sm:px-8 sm:py-8")}>

        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your model — e.g. iPhone 16 Pro, Galaxy S26…"
            className="h-12 rounded-xl border-white/60 bg-white/70 pl-11 text-sm shadow-sm backdrop-blur-md placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            aria-label="Search device model"
          />
        </div>

        {/* ── Live search results ── */}
        {showSearch && (
          <ul className="mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_8px_40px_rgba(0,0,0,0.10)] backdrop-blur-xl">
            {searchResults.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No models found for &ldquo;{searchQuery}&rdquo;
              </li>
            ) : (
              searchResults.map((m) => {
                const brand = allBrands.find((b) => b.id === m.brandId);
                return (
                  <li key={m.id} className="border-b border-white/50 last:border-0">
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
            <span className="h-px flex-1 bg-border/50" />
            <span className="text-xs font-medium text-muted-foreground/70">or choose from dropdowns</span>
            <span className="h-px flex-1 bg-border/50" />
          </div>
        )}

        {/* ── Dropdown row ── */}
        {!showSearch && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <GlassSelect
                value={selectedBrandId}
                onChange={(v) => { setSelectedBrandId(v); setSelectedModelId(""); }}
                placeholder="Choose brand"
                options={brandOptions}
              />
            </div>
            <div className="flex-1">
              <GlassSelect
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
          <p className="mt-3 text-center text-xs text-muted-foreground/60">
            Pick a brand first, then choose your model.
          </p>
        )}

        {/* ── Skin count feedback ── */}
        {selectedModel && !showSearch && (
          <div className="animate-rise mt-4 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-electric-soft/60 px-4 py-3 backdrop-blur-sm">
            <div>
              <p className="text-xs text-muted-foreground">Selected model</p>
              <p className="text-sm font-semibold tracking-tight">{selectedModel.name}</p>
              <p className="mt-0.5 text-xs font-medium text-primary">{count} compatible skins</p>
            </div>
            <Button size="sm" onClick={handleGo} className="shrink-0 gap-1.5">
              Browse Skins <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {/* ── Device not listed? ── */}
        <div className="mt-8 border-t border-border/40 pt-6">
          <div className="mb-4 flex flex-col items-center gap-1 text-center">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Device not listed?
            </span>
            <p className="mt-2 text-sm font-semibold text-foreground">Shop by design instead</p>
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
                  "group flex items-center gap-3 rounded-xl p-4 transition-all duration-200",
                  // glass
                  "border border-white/60 bg-white/60 backdrop-blur-md",
                  "shadow-[0_2px_12px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)]",
                  "hover:bg-white/85 hover:border-primary/30",
                  "hover:shadow-[0_4px_24px_rgba(0,65,200,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]",
                  "hover:-translate-y-0.5"
                )}
              >
                <span className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-200",
                  "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                )}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-tight">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{sublabel}</span>
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
