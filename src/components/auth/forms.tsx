"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, LogIn, Sparkles, UserPlus } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/stores/auth-store";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { ApiError } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

function AuthShell({
  eyebrow,
  title,
  highlight,
  subtitle,
  features,
  icon,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  features: string[];
  icon: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative -mx-0 overflow-hidden bg-background">
      {/* ── Subtle radial gradient ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(10,63,214,0.06) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 85% 100%, rgba(100,80,200,0.05) 0%, transparent 55%)",
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,65,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,65,200,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl items-stretch gap-10 px-5 py-12 lg:items-center lg:px-10 lg:py-16">
        {/* ── Left branding panel (desktop only) ── */}
        <div className="hidden w-[46%] flex-col justify-center lg:flex">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary backdrop-blur">
            <Sparkles className="size-3" />
            {eyebrow}
          </div>
          <h1 className="font-heading text-display-lg text-foreground">
            {title}
            <br />
            <span className="text-primary">{highlight}</span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          <ul className="mt-8 space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground/70">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/15">
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo />
            </div>

            {/* Apple material: translucent layer, saturate, bright top edge */}
            <div className="animate-auth-rise rounded-2xl border border-border bg-card p-7 shadow-pop sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-[0_4px_16px_rgba(10,63,214,0.3)]">
                  {icon}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    {title} <span className="text-primary">{highlight}</span>
                  </h2>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
                </div>
              </div>
              {children}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls = "h-11";

// Design tokens shared by all auth CTAs (Emil: exact properties, never `all`).
const CTA_CLS =
  "h-12 w-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(10,63,214,0.3)] transition-[transform,box-shadow] duration-150 ease-out hover:shadow-[0_6px_20px_rgba(10,63,214,0.4)] active:scale-[0.98]";

// Vercel rule js-hoist-regexp: hoist out of handlers.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function humanize(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

/** After login / register: sync server-side cart & wishlist then redirect. */
function usePostAuthSync() {
  const syncCart = useCart((s) => s.syncFromServer);
  const syncWishlist = useWishlist((s) => s.syncFromServer);
  return async () => {
    await Promise.allSettled([syncCart(), syncWishlist()]);
  };
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuth((s) => s.login);
  const syncAfterAuth = usePostAuthSync();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") ?? "/account";

  function validateEmail(v: string) {
    return EMAIL_RE.test(v) ? null : "Enter a valid email address.";
  }

  function validatePassword(v: string) {
    return v.length >= 6 ? null : "Password must be at least 6 characters.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setLoading(true);
    try {
      await login({ email, password });
      await syncAfterAuth();
      toast.success("Signed in", {
        description: `Welcome back, ${email.split("@")[0]}!`,
      });
      router.push(redirectTo);
    } catch (err) {
      toast.error(humanize(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="phoneX account"
      title="Welcome"
      highlight="back."
      subtitle="Sign in to track orders and access saved designs."
      features={[
        "Track orders & delivery in real time",
        "Sync saved designs, cart & wishlist",
        "Faster checkout with saved addresses",
      ]}
      icon={<LogIn className="size-5" />}
      footer={
        <>
          New to phoneX?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "60ms" }}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={() => setEmailError(email ? validateEmail(email) : null)}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "login-email-error" : undefined}
            required
            disabled={loading}
          />
          <FieldError id="login-email-error" message={emailError} />
        </div>
        <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "110ms" }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${inputCls} pr-10`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              onBlur={() => setPasswordError(password ? validatePassword(password) : null)}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "login-password-error" : undefined}
              required
              disabled={loading}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-90"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError id="login-password-error" message={passwordError} />
        </div>
        <div className="animate-auth-rise" style={{ animationDelay: "160ms" }}>
          <Button
            type="submit"
            size="lg"
            className={CTA_CLS}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------
// Signup form
// ---------------------------------------------------------------------------

export function SignupForm() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const syncAfterAuth = usePostAuthSync();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nErr = name.trim().length >= 2 ? null : "Please enter your full name.";
    const eErr = EMAIL_RE.test(email) ? null : "Enter a valid email address.";
    const pErr = password.length >= 6 ? null : "Password must be at least 6 characters.";
    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (nErr || eErr || pErr) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email, password });
      await syncAfterAuth();
      toast.success("Account created", { description: "Welcome to phoneX!" });
      router.push("/account");
    } catch (err) {
      toast.error(humanize(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Join phoneX"
      title="Create"
      highlight="your account."
      subtitle="Save designs, track orders and check out faster."
      features={[
        "Save & revisit custom studio designs",
        "Wishlist across phones & laptops",
        "Coupons and drops, first in line",
      ]}
      icon={<UserPlus className="size-5" />}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "60ms" }}>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            className={inputCls}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            onBlur={() => setNameError(name && name.trim().length < 2 ? "Please enter your full name." : null)}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "signup-name-error" : undefined}
            required
            disabled={loading}
          />
          <FieldError id="signup-name-error" message={nameError} />
        </div>
        <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "110ms" }}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onBlur={() => setEmailError(email && !EMAIL_RE.test(email) ? "Enter a valid email address." : null)}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "signup-email-error" : undefined}
            required
            disabled={loading}
          />
          <FieldError id="signup-email-error" message={emailError} />
        </div>
        <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "160ms" }}>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              placeholder="Min. 6 characters"
              className={`${inputCls} pr-10`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              onBlur={() =>
                setPasswordError(
                  password && password.length < 6 ? "Password must be at least 6 characters." : null
                )
              }
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "signup-password-error" : undefined}
              required
              disabled={loading}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-90"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError id="signup-password-error" message={passwordError} />
        </div>
        <div className="animate-auth-rise" style={{ animationDelay: "210ms" }}>
          <Button
            type="submit"
            size="lg"
            className={CTA_CLS}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account…
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

// ---------------------------------------------------------------------------
// Forgot-password form
// ---------------------------------------------------------------------------

export function ForgotForm() {
  const forgotPassword = useAuth((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Don't leak whether the email exists — show success regardless of 404
      if (err instanceof ApiError && err.isNotFound) {
        setSent(true);
      } else {
        toast.error(humanize(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset"
      highlight="password."
      subtitle="We'll email you a reset link."
      features={[
        "Secure single-use reset link",
        "Back into your designs in a minute",
        "No password change? Ignore the email",
      ]}
      icon={<KeyRound className="size-5" />}
      footer={
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-violet-500/10 to-fuchsia-500/10 p-4 text-sm leading-6 text-muted-foreground">
          If an account exists for{" "}
          <strong className="text-foreground">{email}</strong>, a reset link is
          on its way. Check your inbox.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="animate-auth-rise space-y-1.5" style={{ animationDelay: "60ms" }}>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "forgot-email-error" : undefined}
              required
              disabled={loading}
            />
            <FieldError id="forgot-email-error" message={emailError} />
          </div>
          <div className="animate-auth-rise" style={{ animationDelay: "110ms" }}>
            <Button
              type="submit"
              size="lg"
              className={CTA_CLS}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending…
                </span>
              ) : (
                "Send reset link"
              )}
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
