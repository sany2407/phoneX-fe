/**
 * Canonical API base URL for every server-side and browser request.
 *
 * `NEXT_PUBLIC_API_URL` is inlined at build time, so a stale hosting env var
 * follows the bundle around. The retired Render deployment still answers, but
 * its catalogue omits current fields (material/finish) and breaks product
 * rendering. Normalise that host to the live API here instead of letting a
 * misconfigured deploy ship a broken storefront.
 *
 * Keep the local fallback in sync with the backend's `/api/v1` prefix.
 */
const LOCAL_FALLBACK = "http://localhost:5000/api/v1";
const RETIRED_HOST = "https://phonex-be.onrender.com";
const LIVE_HOST = "https://phonexbe.innocollab.in";

function resolveApiBase(raw: string | undefined): string {
  const base = (raw?.trim() || LOCAL_FALLBACK).replace(/\/+$/, "");
  return base.startsWith(RETIRED_HOST)
    ? LIVE_HOST + base.slice(RETIRED_HOST.length)
    : base;
}

export const API_BASE_URL = resolveApiBase(process.env.NEXT_PUBLIC_API_URL);
