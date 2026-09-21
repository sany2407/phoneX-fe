"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const login        = useAuth((s) => s.login);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const redirectTo = searchParams.get("redirect") ?? "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });

      const user = useAuth.getState().user;
      if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        await useAuth.getState().logout();
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.push(redirectTo);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh overflow-hidden bg-[#080c14]">

      {/* ── Ambient orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* top-left blue */}
        <div className="absolute -left-40 -top-40 size-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
        {/* bottom-right violet */}
        <div className="absolute -bottom-40 -right-32 size-[500px] rounded-full bg-violet-700/15 blur-[100px]" />
        {/* centre faint */}
        <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
      </div>

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden w-[45%] flex-col justify-between p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary shadow-[0_0_16px_rgba(0,65,200,0.6)]">
            <ShieldCheck className="size-4 text-white" />
          </span>
          <span className="font-heading text-[17px] font-semibold tracking-[-0.03em] text-white">
            phone<span className="font-bold text-primary">X</span>
            <span className="ml-1.5 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Admin
            </span>
          </span>
        </div>

        {/* Centre copy */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
            <Sparkles className="size-3 text-primary" />
            Command Centre
          </div>
          <h1 className="text-display-lg text-white">
            Manage your<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #4d8eff 0%, #a78bfa 60%, #60a5fa 100%)" }}
            >
              entire store.
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/40">
            Orders, inventory, customers, analytics and more — all in one place.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              "Real-time order & revenue dashboard",
              "Inventory and variant management",
              "Customer and review moderation",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/50">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20">
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <p className="text-xs text-white/20">
          Restricted access — authorised personnel only.
        </p>
      </div>

      {/* ── Right login panel ── */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-primary shadow-[0_0_16px_rgba(0,65,200,0.6)]">
              <ShieldCheck className="size-4 text-white" />
            </span>
            <span className="font-heading text-[17px] font-semibold tracking-[-0.03em] text-white">
              phone<span className="font-bold text-primary">X</span>
              <span className="ml-1.5 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                Admin
              </span>
            </span>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Header */}
            <div className="mb-7">
              <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                <Lock className="size-5 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
                Admin sign in
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/70">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@phonex.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-primary/60 focus:ring-primary/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white/70">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/25 focus:border-primary/60 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-12 w-full text-base font-semibold bg-primary hover:bg-primary/90 shadow-[0_4px_24px_rgba(0,65,200,0.4)] transition-all duration-200 hover:shadow-[0_6px_32px_rgba(0,65,200,0.5)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in to Admin"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-white/25">
            Not an admin?{" "}
            <a href="/" className="font-medium text-white/50 hover:text-white transition-colors">
              Back to store
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
