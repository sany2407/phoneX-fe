"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth-store";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// ---------------------------------------------------------------------------
// Minimal typings for the Google Identity Services script
// ---------------------------------------------------------------------------

type GoogleCredentialResponse = { credential?: string };

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: "popup" | "redirect";
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/** True when a Google client id is configured for this build. */
export const googleSignInEnabled = Boolean(CLIENT_ID);

/**
 * "Continue with Google" — renders Google's own sign-in button, which hands
 * us a signed ID token. The API verifies it, links or creates the customer,
 * and returns our usual access/refresh tokens.
 *
 * Google's button is an iframe, so it renders itself rather than accepting
 * custom styles; when no client id is configured the whole section is hidden.
 */
export function GoogleSignIn({
  redirectTo = "/account",
  text = "continue_with",
}: {
  redirectTo?: string;
  text?: Extract<
    GoogleButtonOptions["text"],
    "continue_with" | "signin_with" | "signup_with"
  >;
}) {
  const router = useRouter();
  const googleLogin = useAuth((s) => s.googleLogin);
  const syncCart = useCart((s) => s.syncFromServer);
  const syncWishlist = useWishlist((s) => s.syncFromServer);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);

  const handleCredential = useCallback(
    async (credential: string) => {
      setPending(true);
      try {
        const isNew = await googleLogin(credential);
        await Promise.allSettled([syncCart(), syncWishlist()]);
        toast.success(isNew ? "Welcome to phoneX" : "Signed in", {
          description: isNew
            ? "Your account is ready — let's find your device."
            : "You're back in. Your cart and wishlist are up to date.",
        });
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Google sign-in failed. Please try again."
        );
      } finally {
        setPending(false);
      }
    },
    [googleLogin, syncCart, syncWishlist, router, redirectTo]
  );

  // Keep the latest handler without re-initialising Google on every render.
  const handlerRef = useRef(handleCredential);
  useEffect(() => {
    handlerRef.current = handleCredential;
  }, [handleCredential]);

  const renderButton = useCallback(() => {
    const google = window.google;
    const container = containerRef.current;
    if (!CLIENT_ID || !google || !container) return;

    const containerWidth = container.clientWidth || 300;
    const width = Math.min(400, Math.max(200, Math.round(containerWidth)));

    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        if (response.credential) void handlerRef.current(response.credential);
      },
      ux_mode: "popup",
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "left",
      width,
    });
  }, [text]);

  useEffect(() => {
    if (scriptReady) renderButton();
  }, [scriptReady, renderButton]);

  // The button is a fixed-width iframe — redraw it when the column resizes.
  useEffect(() => {
    const container = containerRef.current;
    if (!scriptReady || !container) return;

    let lastWidth = container.clientWidth;
    const observer = new ResizeObserver(() => {
      const next = container.clientWidth;
      if (Math.abs(next - lastWidth) < 8) return;
      lastWidth = next;
      renderButton();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [scriptReady, renderButton]);

  if (!CLIENT_ID) return null;

  return (
    <div>
      <div className="my-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          OR
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />

      <div
        aria-busy={pending}
        className={pending ? "pointer-events-none opacity-60" : undefined}
      >
        <div
          ref={containerRef}
          className="flex min-h-10 w-full items-center justify-center"
        />
      </div>
    </div>
  );
}
