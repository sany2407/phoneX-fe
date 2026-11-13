"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRightIcon as ArrowRight,
  EyeOpenIcon as Eye,
  EyeNoneIcon as EyeOff,
  LockClosedIcon as LockKeyhole,
  EnvelopeClosedIcon as Mail,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { useAuth } from "@/lib/stores/auth-store";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { ApiError } from "@/lib/api-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Tinted filled fields, per the sign-in design.
const FIELD_CLS =
  "h-12 rounded-xl border-transparent bg-primary-soft/50 pl-11 text-[15px] placeholder:text-muted-foreground/60 focus-visible:border-primary/40";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuth((s) => s.login);
  const syncCart = useCart((s) => s.syncFromServer);
  const syncWishlist = useWishlist((s) => s.syncFromServer);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") ?? "/account";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    try {
      await login({ email, password });
      await Promise.allSettled([syncCart(), syncWishlist()]);
      toast.success("Signed in", {
        description: `Welcome back, ${email.split("@")[0]}!`,
      });
      router.push(redirectTo);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Email or password is incorrect. Check both and try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={FIELD_CLS}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={!!error}
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className={`${FIELD_CLS} pr-11`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={!!error}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors outline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-sale-soft px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="press relative h-12 w-full rounded-xl text-base"
          disabled={pending}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </span>
          ) : (
            <>
              Sign in
              <ArrowRight
                className="absolute right-5 size-5"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </form>

      {/* Social sign-in */}
      <GoogleSignIn redirectTo={redirectTo} text="continue_with" />
    </div>
  );
}
