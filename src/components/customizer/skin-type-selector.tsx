"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { DeviceModel, MaterialId } from "@/lib/types";
import { SKIN_TYPES, customPriceLabel } from "@/lib/custom-pricing";
import { cn } from "@/lib/utils";

export function SkinTypeSelector({
  model,
  value,
  onChange,
}: {
  model: DeviceModel;
  value: MaterialId;
  onChange: (t: MaterialId) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Skin type</legend>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SKIN_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={value === t.id}
            onClick={() => onChange(t.id)}
            title={t.description}
            className={cn(
              "press rounded-lg border px-3 py-2.5 text-left",
              value === t.id
                ? "border-transparent ring-2 ring-primary"
                : "hover:bg-muted"
            )}
          >
            <span className="block text-sm font-medium">{t.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {customPriceLabel(model, t.id)}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function UploadField({
  onImage,
  label = "Upload your design",
  variant = "default",
}: {
  onImage: (dataUrl: string) => void;
  label?: string;
  variant?: "default" | "outline";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            toast.error("Please choose a PNG or JPG image.");
            return;
          }
          const { fileToDownscaledDataURL } = await import("@/lib/editor/image-upload");
          try {
            onImage(await fileToDownscaledDataURL(file));
            toast.success("Artwork added to your device");
          } catch {
            toast.error("That image could not be processed. Try another file.");
          }
        }}
      />
      <Button type="button" variant={variant} onClick={() => inputRef.current?.click()}>
        {label}
      </Button>
    </>
  );
}
