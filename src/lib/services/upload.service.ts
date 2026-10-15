/**
 * Cloudinary upload service.
 *
 * Endpoints:
 *   POST /upload/single?folder=products    — one file, field: "image"
 *   POST /upload/multiple?folder=products  — up to 10 files, field: "images"
 *
 * Both require a valid admin Bearer token.
 * Response shape: { success: true, data: { url, publicId } }
 *                 (multiple returns { data: { urls: string[], publicIds: string[] } })
 */
import { tokenStore } from "@/lib/api-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export type UploadFolder =
  | "products"
  | "variants"
  | "categories"
  | "brands"
  | "models";

/**
 * Upload a single file. Returns the Cloudinary URL.
 */
export async function uploadSingle(
  file: File,
  folder: UploadFolder = "products"
): Promise<string> {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`${BASE_URL}/upload/single?folder=${folder}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenStore.getAccess() ?? ""}`,
    },
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      (json.message as string) || `Upload failed (${res.status})`
    );
  }

  const url: string = json.data?.url ?? json.url;
  if (!url) throw new Error("Upload succeeded but no URL was returned.");
  return url;
}

/**
 * Upload multiple files. Returns an array of Cloudinary URLs.
 */
export async function uploadMultiple(
  files: File[],
  folder: UploadFolder = "products"
): Promise<string[]> {
  if (files.length === 0) return [];

  const form = new FormData();
  files.forEach((f) => form.append("images", f));

  const res = await fetch(`${BASE_URL}/upload/multiple?folder=${folder}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenStore.getAccess() ?? ""}`,
    },
    body: form,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      (json.message as string) || `Upload failed (${res.status})`
    );
  }

  // Server may return { data: { urls: [] } } or { data: [{ url }] }
  const data = json.data;
  if (Array.isArray(data?.urls)) return data.urls as string[];
  if (Array.isArray(data))
    return (data as { url: string }[]).map((d) => d.url);

  // Fallback: single-file response wrapped in array
  if (data?.url) return [data.url as string];
  throw new Error("Upload succeeded but no URLs were returned.");
}
