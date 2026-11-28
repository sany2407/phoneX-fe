"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="flex max-w-sm gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error("Please enter a valid email address.");
          return;
        }
        setDone(true);
        toast.success("You're on the list. Welcome to phoneX.");
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <Input
        id="newsletter-email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-white/60"
        disabled={done}
      />
      <button
        type="submit"
        disabled={done}
        className="press inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-white/90 disabled:opacity-70"
      >
        {done ? <Check className="size-4" /> : <>Subscribe <ArrowRight className="size-4" /></>}
      </button>
    </form>
  );
}
