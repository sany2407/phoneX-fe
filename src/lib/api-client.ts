/**
 * Typed fetch wrapper for the phonex backend.
 *
 * Features:
 * - Automatically attaches the Bearer token from localStorage
 * - Transparent access-token refresh using the refresh-token cookie flow
 * - Throws `ApiError` on non-2xx responses so callers can pattern-match
 * - Works in both browser (client components / Zustand actions) and
 *   server (Server Components / Route Handlers) contexts
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Convenience: check if this is a 401 Unauthorized */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** Convenience: check if this is a 404 Not Found */
  get isNotFound() {
    return this.status === 404;
  }

  /** Convenience: check if this is a validation error */
  get isValidation() {
    return this.status === 422 || this.status === 400;
  }
}

// ---------------------------------------------------------------------------
// Token helpers  (browser-only; no-ops on the server)
// ---------------------------------------------------------------------------

const ACCESS_KEY = "phonex_access_token";
const REFRESH_KEY = "phonex_refresh_token";
const ROLE_KEY    = "phonex_role";

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  setAccess(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, token);
    // Mirror to cookie so Edge middleware can read it for route protection.
    document.cookie = `${ACCESS_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefresh(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_KEY, token);
  },
  setRole(role: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${ROLE_KEY}=${encodeURIComponent(role)}; path=/; SameSite=Lax`;
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    // Expire both middleware cookies
    document.cookie = `${ACCESS_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

// ---------------------------------------------------------------------------
// Internal: single token-refresh attempt (prevents refresh storms)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) throw new ApiError(401, "NO_REFRESH_TOKEN", "Not authenticated");

    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      tokenStore.clear();
      throw new ApiError(401, "REFRESH_FAILED", "Session expired. Please sign in again.");
    }

    const data = await res.json();
    const newToken: string = data.data?.accessToken ?? data.accessToken;
    tokenStore.setAccess(newToken);

    // Backend may also rotate the refresh token
    const newRefresh: string | undefined =
      data.data?.refreshToken ?? data.refreshToken;
    if (newRefresh) tokenStore.setRefresh(newRefresh);

    return newToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  /** Additional headers to merge */
  headers?: Record<string, string>;
  /** JSON body — will be serialised automatically */
  body?: unknown;
  /** When true the request will NOT include the Authorization header */
  public?: boolean;
  /** Next.js fetch cache options (server-side only) */
  next?: NextFetchRequestConfig;
  /** Standard fetch cache option */
  cache?: RequestCache;
}

export async function apiRequest<T = unknown>(
  method: Method,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const buildHeaders = (token: string | null): Record<string, string> => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token && !options.public) {
      h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  };

  const execute = async (token: string | null): Promise<Response> => {
    return fetch(url, {
      method,
      headers: buildHeaders(token),
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      ...(options.cache ? { cache: options.cache } : {}),
      ...(options.next ? { next: options.next } : {}),
    });
  };

  let token = options.public ? null : tokenStore.getAccess();
  let res = await execute(token);

  // Attempt a single transparent token refresh on 401
  if (res.status === 401 && !options.public) {
    try {
      token = await refreshAccessToken();
      res = await execute(token);
    } catch {
      tokenStore.clear();
      throw new ApiError(401, "UNAUTHENTICATED", "Session expired. Please sign in again.");
    }
  }

  // Parse JSON (even error bodies)
  let json: Record<string, unknown> = {};
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    json = await res.json();
  }

  if (!res.ok) {
    const message =
      (json.message as string) ||
      (json.error as string) ||
      `Request failed with status ${res.status}`;
    const code = (json.code as string) || String(res.status);
    throw new ApiError(res.status, code, message);
  }

  // Most endpoints wrap data in { success, data, message }
  return (json.data ?? json) as T;
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "body">) =>
    apiRequest<T>("GET", path, opts),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("POST", path, { ...opts, body }),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("PUT", path, { ...opts, body }),

  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    apiRequest<T>("PATCH", path, { ...opts, body }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>("DELETE", path, opts),
};
