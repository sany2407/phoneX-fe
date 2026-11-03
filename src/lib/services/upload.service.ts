/**
 * Cloudinary upload service.
 *
 * Endpoints:
 *   POST /upload/single?folder=products    — one file, field: "image"
 *   POST /upload/multiple?folder=products  — up to 10 files, field: "images"
 *
 * Both require a valid admin Bearer token. Requests go through
 * `apiUploadForm`, which refreshes an expired access token once and retries.
 * Response shape: { success: true, data: { url, publicId } }
 *                 (multiple returns { data: { urls: string[], count: number } })
 */
import { apiUploadForm } from "@/lib/api-client";

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

  const data = await apiUploadForm<{ url?: string }>(
    `/upload/single?folder=${folder}`,
    form
  );

  const url = data?.url;
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

  const data = await apiUploadForm<{
    urls?: string[];
    url?: string;
  }>(`/upload/multiple?folder=${folder}`, form);

  if (Array.isArray(data?.urls)) return data.urls;
  if (data?.url) return [data.url];

  throw new Error("Upload succeeded but no URLs were returned.");
}
