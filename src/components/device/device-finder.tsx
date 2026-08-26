"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Laptop, Search, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBrands, getModels, countForModel } from "@/lib/api";
import type { DeviceModel, DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Device", "Brand", "Model"] as const;

export function DeviceFinder({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<DeviceType | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [model, setModel] = useState<DeviceModel | null>(null);
  const [query, setQuery] = useState("");

  const brands = useMemo(() => (type ? getBrands(type) : []), [type]);
  const models = useMemo(
    () =>
      brandId
        ? getModels({ brandId }).filter((m) =>
            m.name.toLowerCase().includes(query.trim().toLowerCase())
          )
        : [],
    [brandId, query]
  );
  const brand = brands.find((b) => b.id === brandId);
  const count = model ? countForModel(model) : 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* header */}
      <div className="flex items-center gap-2 border-b px-6 py-4">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                i === step
                  ? "text-foreground"
                  : i < step
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[11px] font-bold",
                  i === step && "bg-primary text-primary-foreground",
                  i < step && "bg-electric-soft text-primary",
                  i > step && "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-border sm:w-8" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className={cn("px-6 py-6", !compact && "sm:px-8 sm:py-8")}>
        {/* Step 1 — device family */}
        {step === 0 && (
          <div>
            <h3 className="text-headline-lg">What are you looking for?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We only show skins cut for your exact device.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {(
                [
                  { id: "phone", label: "Phone", icon: Smartphone },
                  { id: "laptop", label: "Laptop", icon: Laptop },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setType(id);
                    setStep(1);
                  }}
                  aria-pressed={type === id}
                  className={cn(
                    "press flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-background p-6 shadow-none ring-1 ring-border hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:p-10",
                    type === id && "border-transparent ring-2 ring-primary"
                  )}
                >
                  <Icon className="size-7 text-primary" aria-hidden="true" />
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — brand */}
        {step === 1 && type && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select brand</h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                <ArrowLeft /> Back
              </Button>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {brands.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandId(b.id);
                      setQuery("");
                      setStep(2);
                    }}
                    className="press w-full rounded-lg border bg-background px-3 py-3 text-sm font-medium ring-0 transition-shadow hover:border-foreground/30 hover:shadow-card-hover"
                  >
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 3 — model */}
        {step === 2 && brand && (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Select your {brand.name} {type === "phone" ? "phone" : "laptop"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft /> Back
              </Button>
            </div>

            <div className="relative mt-4 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${brand.name} models…`}
                className="h-11 pl-9"
                aria-label="Search models"
              />
            </div>

            {models.length === 0 ? (
              <p className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                No models match “{query}”. Try a different search.
              </p>
            ) : (
              <ul className="mt-4 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-72">
                {models.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setModel(m)}
                      aria-pressed={model?.id === m.id}
                      className={cn(
                        "press w-full rounded-lg border px-4 py-3 text-left text-sm font-medium ring-0 hover:shadow-card-hover",
                        model?.id === m.id
                          ? "border-transparent ring-2 ring-primary"
                          : "hover:border-foreground/30"
                      )}
                    >
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {model && (
              <div className="animate-rise mt-6 flex flex-col gap-4 rounded-xl bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-label-sm text-muted-foreground">Selected</p>
                  <p className="font-semibold">{model.name}</p>
                  <p className="mt-0.5 text-sm text-primary">
                    <strong>{count}</strong> compatible skins found
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(`/devices/${brand.slug}/${model.slug}`)
                  }
                  disabled={count === 0}
                >
                  Browse Skins <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
