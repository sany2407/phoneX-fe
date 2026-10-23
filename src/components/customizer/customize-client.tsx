"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ImageUp, RotateCcw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DevicePicker } from "@/components/customizer/device-picker";
import {
  CustomDevicePreview,
} from "@/components/customizer/device-preview";
import {
  SkinTypeSelector,
  UploadField,
} from "@/components/customizer/skin-type-selector";
import { materialLabel } from "@/lib/taxonomy";
import { type PickerModel } from "@/lib/live-devices";
import { useDeviceCatalog } from "@/lib/stores/device-catalog-store";
import { customPrice, customPriceLabel } from "@/lib/custom-pricing";
import { useCart } from "@/lib/stores/cart-store";
import { useDesigns } from "@/lib/stores/designs-store";
import type { MaterialId } from "@/lib/types";
import { uid } from "@/lib/editor/image-upload";

type Step = "device" | "design";

interface StudioInit {
  step: Step;
  model: PickerModel | null;
  skinType: MaterialId;
  imageSrc?: string;
  savedId: string | null;
}

export function CustomizeClient() {
  const router = useRouter();
  const params = useSearchParams();

  // Re-initialise when the deep-link params change (render-adjust pattern)
  const paramKey = params.toString();
  const [prevKey, setPrevKey] = useState(paramKey);
  const [init, setInit] = useState<StudioInit>({ step: "device", model: null, skinType: "matte", savedId: null });
  const [linkReady, setLinkReady] = useState(false);
  if (paramKey !== prevKey) {
    setPrevKey(paramKey);
    setLinkReady(false);
    setInit({ step: "device", model: null, skinType: "matte", savedId: null });
  }

  // Resolve deep links (?device=<model-id> or ?design=<id>) against live data
  useEffect(() => {
    if (linkReady) return;
    const designId = params.get("design");
    const deviceId = params.get("device");
    if (!designId && !deviceId) { setLinkReady(true); return; }
    let cancelled = false;
    (async () => {
      try {
        await useDeviceCatalog.getState().load();
        if (cancelled) return;
        const getModel = useDeviceCatalog.getState().getModel;
        if (designId) {
          const existing = useDesigns.getState().designs.find((d) => d.id === designId);
          const model = existing ? getModel(existing.deviceId) : undefined;
          if (existing && model) {
            setInit({ step: "design", model, skinType: existing.skinType, imageSrc: existing.imageSrc, savedId: existing.id });
          }
        } else if (deviceId) {
          const model = getModel(deviceId);
          if (model) setInit({ step: "design", model, skinType: "matte", savedId: null });
        }
      } finally {
        if (!cancelled) setLinkReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [params, linkReady]);

  const { step, model, skinType, imageSrc, savedId } = init;

  const patch = (p: Partial<StudioInit>) => setInit((s) => ({ ...s, ...p }));

  if (step === "device" || !model) {
    return (
      <div className="container-x py-12 lg:py-16">
        <DevicePicker
          value={model ?? undefined}
          onConfirm={(m) => {
            setInit({ step: "design", model: m, skinType: "matte", savedId: null });
          }}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-label-sm text-primary">Custom skin studio</p>
          <h1 className="mt-1.5 font-heading text-headline-lg tracking-tight">
            Your art on your {model.kind === "other" ? "device" : model.kind}
          </h1>
        </div>
        <Button variant="ghost" onClick={() => patch({ step: "device", model: null, savedId: null })}>
          <ArrowLeft /> Change device
        </Button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        {/* live preview */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border bg-secondary/60 p-8">
            <div className={model.kind === "laptop" ? "mx-auto w-full max-w-md" : "mx-auto w-56 sm:w-64"}>
              <CustomDevicePreview
                deviceType={model.kind === "laptop" ? "laptop" : model.kind === "tablet" ? "tablet" : "phone"}
                brand={model.brandSlug}
                imageSrc={imageSrc}
                onArtworkChange={(src) => patch({ imageSrc: src, savedId: null })}
              />
            </div>
            {!imageSrc && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Upload an image to see it on your{" "}
                <span className="font-medium text-foreground">{model.name}</span>.
              </p>
            )}
            <p className="mt-2 text-center text-[11px] text-muted-foreground/80">
              The device mockup is just for reference — your skin is
              precision-cut for your actual device.
            </p>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3.5 text-primary" aria-hidden="true" />
            Preview shows exact cutouts for {model.name}
          </p>
        </div>

        {/* controls */}
        <div className="space-y-8">
          <section
            aria-label="Upload artwork"
            className="rounded-xl border bg-card p-6"
          >
            <h2 className="font-heading font-semibold">1. Add your artwork</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              PNG or JPG, portrait works best for phones and wide for laptops.
              We print at 300 DPI.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <UploadField
                label={imageSrc ? "Replace image" : "Upload image"}
                onImage={(src) => {
                  patch({ imageSrc: src, savedId: null });
                }}
              />
              {imageSrc && (
                <Button
                  variant="outline"
                  onClick={() => {
                    patch({ imageSrc: undefined, savedId: null });
                  }}
                >
                  <RotateCcw /> Remove
                </Button>
              )}
            </div>
          </section>

          <section aria-label="Skin type" className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">2. Pick a finish</h2>
            <div className="mt-4">
              <SkinTypeSelector
                kind={model.kind}
                value={skinType}
                onChange={(t) => {
                  patch({ skinType: t, savedId: null });
                }}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {materialLabel(skinType)} — cut to the millimetre with camera and
              port cutouts, residue-free on removal.
            </p>
          </section>

          <section aria-label="Summary and actions" className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">3. Get it printed</h2>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Device</dt>
                <dd className="font-medium">{model.brandName} {model.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Skin type</dt>
                <dd className="font-medium">{materialLabel(skinType)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="text-price-point">{customPriceLabel(model.kind, skinType)}</dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-12"
                disabled={!imageSrc}
                onClick={() => {
                  const id = savedId ?? uid();
                  useDesigns.getState().upsert({
                    id,
                    deviceId: model.id,
                    deviceName: model.name,
                    skinType,
                    imageSrc: imageSrc!,
                    updatedAt: Date.now(),
                  });
                  patch({ savedId: id });
                  toast.success("Design saved", {
                    description: "Find it anytime under Account → Saved designs.",
                    action: {
                      label: "View",
                      onClick: () => router.push("/account/designs"),
                    },
                  });
                }}
              >
                <Check /> {savedId ? "Update saved design" : "Save design"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12"
                disabled={!imageSrc}
                onClick={() => {
                  useCart.getState().add({
                    key: `custom:${savedId ?? uid()}:${model.id}:${skinType}`,
                    kind: "custom",
                    title: "Custom skin",
                    subtitle: `${materialLabel(skinType)} · ${model.name}`,
                    deviceId: model.id,
                    deviceName: model.name,
                    unitPrice: customPrice(model.kind, skinType),
                    thumb: imageSrc,
                    designId: savedId ?? undefined,
                  });
                  toast.success("Added to cart");
                  router.push("/cart");
                }}
              >
                <ShoppingBag /> Add to Cart
              </Button>
            </div>
            {!imageSrc && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageUp className="size-3.5" aria-hidden="true" />
                Upload an image first — then save it or send it straight to the printer.
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Prefer a ready-made design?{" "}
              <Link href="/shop" className="font-semibold text-primary hover:underline">
                Browse the catalogue
              </Link>{" "}
              — 500+ designs await.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
