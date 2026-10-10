"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/stores/auth-store";
import { ApiError } from "@/lib/api-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotForm() {
  const forgotPassword = useAuth((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Don't leak whether the email exists — show success regardless of 404
      if (err instanceof ApiError && err.isNotFound) {
        setSent(true);
      } else {
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="rounded-md bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
        If an account exists for{" "}
        <strong className="text-foreground">{email}</strong>, a reset link is
        on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-11"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={!!error}
          disabled={pending}
        />
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
        className="press h-11 w-full"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
