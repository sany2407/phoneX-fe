"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cartTotals, useCart } from "@/lib/stores/cart-store";
import { useOrders } from "@/lib/stores/orders-store";
import { useAuth, uid32 } from "@/lib/stores/auth-store";
import { getCoupons } from "@/lib/api";
import type { Coupon, Order } from "@/lib/types";
import { formatINR, orderNumber } from "@/lib/utils";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

function buildOrder(args: {
  id: string;
  items: ReturnType<typeof useCart.getState>["items"];
  totals: { subtotal: number; shipping: number };
  discount: number;
  freeShipping: boolean;
  couponCode?: string;
  customer: FormState;
}): Order {
  const now = Date.now();
  return {
    id: args.id,
    createdAt: now,
    items: args.items.map((i) => ({
      title: i.title,
      subtitle: i.subtitle,
      deviceName: i.deviceName,
      unitPrice: i.unitPrice,
      qty: i.qty,
      thumb: i.thumb,
    })),
    subtotal: args.totals.subtotal,
    discount: args.discount,
    shipping: args.freeShipping ? 0 : args.totals.shipping,
    total: Math.max(0, args.totals.subtotal - args.discount + (args.freeShipping ? 0 : args.totals.shipping)),
    couponCode: args.couponCode,
    status: "Confirmed",
    history: [{ status: "Confirmed", at: now }],
    customer: { ...args.customer },
  };
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

function Field({
  id,
  label,
  error,
  ...props
}: {
  id: keyof FormState;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        className="h-11"
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const place = useOrders((s) => s.place);
  const user = useAuth((s) => s.user);

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [payMethod, setPayMethod] = useState("upi");

  const totals = cartTotals(items);
  const discount = coupon?.pct
    ? Math.round((totals.subtotal * coupon.pct) / 100)
    : 0;
  const freeShipping =
    coupon?.freeShippingOver != null &&
    totals.subtotal >= coupon.freeShippingOver;
  const shipping = totals.shipping;
  const total = Math.max(0, totals.subtotal - discount + (freeShipping ? 0 : shipping));

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!form.line1.trim()) e.line1 = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "PIN code must be 6 digits.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function applyCoupon() {
    const found = getCoupons().find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );
    if (!found) {
      toast.error(`“${couponInput}” is not a valid code.`);
      return;
    }
    if (found.freeShippingOver != null && totals.subtotal < found.freeShippingOver) {
      toast.error(`${found.code} needs a minimum order of ${formatINR(found.freeShippingOver)}.`);
      return;
    }
    setCoupon(found);
    toast.success(`${found.code} applied — ${found.label}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    // Simulated payment capture — Razorpay hooks in here during integration.
    const order = buildOrder({
      id: uid32(),
      items,
      totals,
      discount,
      freeShipping,
      couponCode: coupon?.code,
      customer: form,
    });
    place(order);
    clear();
    toast.success("Order confirmed!", {
      description: `Order ${orderNumber(order.id)} is being prepared.`,
    });
    router.replace(`/orders/${order.id}?placed=1`);
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-headline-lg">Nothing to check out</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          Your cart is empty. Add a skin or a custom design first.
        </p>
        <Button size="lg" className="mt-6 h-12" asChild>
          <Link href="/shop">Shop skins</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Checkout</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]" id="checkout-form">
        <div className="space-y-10">
          {/* Contact + address */}
          <section aria-labelledby="addr-heading" className="rounded-xl border bg-card p-6">
            <h2 id="addr-heading" className="font-heading font-semibold">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Full name" autoComplete="name" value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={errors.fullName} />
              <Field id="phone" label="Phone" type="tel" inputMode="numeric" autoComplete="tel"
                placeholder="98765 43210" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
              <div className="sm:col-span-2">
                <Field id="email" label="Email" type="email" autoComplete="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              </div>
              <div className="sm:col-span-2">
                <Field id="line1" label="Address" autoComplete="street-address"
                  placeholder="Flat, street, landmark" value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })} error={errors.line1} />
              </div>
              <Field id="city" label="City" autoComplete="address-level2" value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })} error={errors.city} />
              <div className="grid grid-cols-2 gap-4">
                <Field id="state" label="State" autoComplete="address-level1" value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })} error={errors.state} />
                <Field id="pincode" label="PIN code" inputMode="numeric" autoComplete="postal-code" value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })} error={errors.pincode} />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section aria-labelledby="pay-heading" className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 id="pay-heading" className="font-heading font-semibold">Payment</h2>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" /> Secured by Razorpay
              </span>
            </div>
            <RadioGroup value={payMethod} onValueChange={setPayMethod} className="mt-4 space-y-3">
              {[
                ["upi", "UPI", "GPay, PhonePe, Paytm"],
                ["card", "Card", "Visa, Mastercard, RuPay"],
                ["netbanking", "Netbanking", "All major banks"],
              ].map(([value, label, hint]) => (
                <Label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                    payMethod === value ? "border-transparent ring-2 ring-primary" : ""
                  }`}
                >
                  <RadioGroupItem value={value} />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>
        </div>

        {/* Summary */}
        <aside aria-label="Order summary" className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">Order summary</h2>
            <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3 text-sm">
                  {i.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.thumb} alt="" className="size-12 rounded-md border object-cover" />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-md border bg-secondary text-xs font-semibold text-muted-foreground">
                      {i.qty}×
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{i.subtitle}</span>
                  </span>
                  <span className="tabular-nums">{formatINR(i.unitPrice * i.qty)}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            {/* Coupon */}
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-10 uppercase"
              />
              <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            {coupon && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" /> {coupon.code} — {coupon.label}
              </p>
            )}

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <dt>Discount ({coupon?.code})</dt>
                  <dd className="tabular-nums">−{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">
                  {freeShipping || totals.shipping === 0
                    ? "Free"
                    : formatINR(totals.shipping)}
                </dd>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(total)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" form="checkout-form" className="mt-6 h-12 w-full text-base">
              <Lock /> Pay {formatINR(total)}
            </Button>
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
              By placing this order you agree to our terms. Custom designs are
              printed just for you.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
