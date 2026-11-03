"use client";

import { useRef, useState } from "react";
import {
  ImageIcon,
  UploadIcon,
  Cross2Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DevicePhoto } from "@/components/device/device-photo";
import { uploadSingle, type UploadFolder } from "@/lib/services/upload.service";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

/**
 * Image picker that uploads straight to Cloudinary through the API
 * (`POST /upload/single?folder=…`) and stores only the returned URL.
 *
 * Admins can drag a file onto the preview, pick one from disk, or paste an
 * existing https URL. The stored value is the URL, so either path works.
 */
export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  folder,
  hint = "PNG, JPG or WebP · up to 5 MB",
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  hint?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 5 MB. Please compress it first.");
      return;
    }

    setBusy(true);
    try {
      const url = await uploadSingle(file, folder);
      onChange(url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`${id}-url`}>{label}</Label>

      <div className="flex items-start gap-3">
        <div
          onDragOver={(e) => {
            if (disabled || busy) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (disabled || busy) return;
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted/30 transition-colors",
            value ? "border" : "border border-dashed",
            dragging && "border-primary bg-primary/5"
          )}
        >
          {value ? (
            <>
              <DevicePhoto src={value} alt="Selected image" sizes="80px" className="p-1.5" />
              <button
                type="button"
                onClick={() => onChange("")}
                disabled={disabled || busy}
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-foreground/10 transition-colors hover:text-destructive"
                aria-label="Remove image"
              >
                <Cross2Icon className="size-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="size-5 text-muted-foreground/60" aria-hidden="true" />
          )}

          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-background/80 text-xs font-medium text-muted-foreground">
              <ReloadIcon className="size-4 animate-spin" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="gap-1.5"
            >
              <UploadIcon className="size-3.5" />
              {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
            </Button>
            <span className="text-xs text-muted-foreground">or drop a file here</span>
          </div>

          <Input
            id={`${id}-url`}
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            placeholder="…or paste an image URL"
            className="h-9 text-xs"
            disabled={disabled || busy}
          />

          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
