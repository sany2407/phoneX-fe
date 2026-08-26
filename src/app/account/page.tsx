"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAuth } from "@/lib/stores/auth-store";
import { useOrders } from "@/lib/stores/orders-store";

export default function AccountPage() {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const addresses = useAuth((s) => s.addresses);
  const addAddress = useAuth((s) => s.addAddress);
  const removeAddress = useAuth((s) => s.removeAddress);
  const orderCount = useOrders((s) => s.orders.length);

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addr, setAddr] = useState({
    label: "",
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!hydrated) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x grid place-items-center py-20 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
            <UserRound className="size-6 text-muted-foreground" />
          </span>
          <h1 className="mt-5 text-headline-lg">You&apos;re signed out</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your profile, addresses and designs.
          </p>
          <Button size="lg" className="mt-6 h-12" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x max-w-4xl py-10 lg:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-label-sm text-primary capitalize">{user.email}</p>
          <h1 className="mt-1.5 font-heading text-headline-lg tracking-tight">
            Hi, {user.name.split(" ")[0]}
          </h1>
        </div>
        <nav aria-label="Account shortcuts" className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/orders">Orders ({orderCount})</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/designs">Saved designs</Link>
          </Button>
        </nav>
      </header>

      {/* Profile */}
      <section
        aria-labelledby="profile-heading"
        className="mt-10 rounded-xl border bg-card p-6"
      >
        <h2 id="profile-heading" className="font-heading font-semibold">Profile</h2>
        <ProfileForm key={user.email} user={user} />
      </section>

      {/* Addresses */}
      <section
        aria-labelledby="addr-heading"
        className="mt-8 rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="addr-heading" className="font-heading font-semibold">Saved addresses</h2>
          <Button variant="outline" size="sm" onClick={() => setShowAddrForm((v) => !v)}>
            <Plus /> {showAddrForm ? "Hide form" : "Add address"}
          </Button>
        </div>

        {addresses.length === 0 && !showAddrForm ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-primary" />
            No addresses yet — add one for faster checkout.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="relative rounded-lg border p-4 pr-10">
                {a.isDefault && (
                  <span className="absolute right-3 top-3 rounded bg-electric-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    Default
                  </span>
                )}
                <p className="text-sm font-semibold">{a.label || a.fullName}</p>
                <address className="mt-1 not-italic text-sm leading-6 text-muted-foreground">
                  {a.fullName}
                  <br />
                  {a.line1}
                  <br />
                  {a.city}, {a.state} {a.pincode}
                  <br />
                  {a.phone}
                </address>
                <button
                  type="button"
                  aria-label={`Delete ${a.label || a.fullName}`}
                  onClick={() => {
                    removeAddress(a.id);
                    toast.success("Address removed");
                  }}
                  className="absolute bottom-3 right-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {showAddrForm && (
          <form
            className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!addr.fullName.trim() || !addr.line1.trim() || !/^\d{6}$/.test(addr.pincode)) {
                toast.error("Fill name, address line and a valid 6-digit PIN code.");
                return;
              }
              addAddress(addr);
              setAddr({ label: "", fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
              setShowAddrForm(false);
              toast.success("Address saved");
            }}
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad-label">Label (e.g. Home)</Label>
              <Input id="ad-label" className="h-11" value={addr.label}
                onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-name">Full name</Label>
              <Input id="ad-name" className="h-11" value={addr.fullName}
                onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-phone">Phone</Label>
              <Input id="ad-phone" type="tel" className="h-11" value={addr.phone}
                onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad-line1">Address</Label>
              <Input id="ad-line1" className="h-11" value={addr.line1}
                onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-city">City</Label>
              <Input id="ad-city" className="h-11" value={addr.city}
                onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ad-state">State</Label>
                <Input id="ad-state" className="h-11" value={addr.state}
                  onChange={(e) => setAddr({ ...addr, state: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-pin">PIN code</Label>
                <Input id="ad-pin" inputMode="numeric" className="h-11" value={addr.pincode}
                  onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} required />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save address</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone?: string };
}) {
  const updateProfile = useAuth((s) => s.updateProfile);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");

  return (
    <form
      className="mt-5 grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
        toast.success("Profile updated");
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="acc-name">Name</Label>
        <Input id="acc-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="acc-email">Email</Label>
        <Input id="acc-email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="acc-phone">Phone</Label>
        <Input id="acc-phone" type="tel" placeholder="98765 43210" className="h-11"
          value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
