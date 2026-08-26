"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/stores/auth-store";

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="container-x grid place-items-center py-16 lg:py-24">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8">
          <h1 className="text-headline-lg">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}

const inputCls = "h-11";

export function LoginForm() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders and access saved designs."
      footer={
        <>
          New to phoneX?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Enter a valid email address.");
            return;
          }
          if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
          }
          signIn(email);
          toast.success("Signed in", { description: `Welcome back, ${email.split("@")[0]}!` });
          router.push("/account");
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className={inputCls}
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" className={inputCls}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          Sign in
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          This demo stores your session on this device only.
        </p>
      </form>
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthShell
      title="Create account"
      subtitle="Save designs, track orders and check out faster."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2) {
            toast.error("Please enter your name.");
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Enter a valid email address.");
            return;
          }
          if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
          }
          signIn(email, name);
          toast.success("Account created", { description: "Welcome to phoneX!" });
          router.push("/account");
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" className={inputCls}
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className={inputCls}
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={6} className={inputCls}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-lg bg-secondary p-4 text-sm leading-6 text-muted-foreground">
          If an account exists for <strong className="text-foreground">{email}</strong>,
          a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              toast.error("Enter a valid email address.");
              return;
            }
            setSent(true);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className={inputCls}
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full text-base">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
