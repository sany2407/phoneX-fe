"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/stores/auth-store";
import { couponsService } from "@/lib/services/coupons.service";
import { ordersService } from "@/lib/services/orders.service";
import { paymentsService } from "@/lib/services/payments.service";
import { addressesService } from "@/lib/services/addresses.service";
import { toFrontendOrder } from "@/lib/stores/orders-store";
import { ApiError } from "@/lib/api-client";
import type { ValidateCouponResponse } from "@/lib/api-types";
import type { Address } from "@/lib/types";
import { formatINR, orderNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Razorpay script loader
// ---------------------------------------------------------------------------

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as Window & { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<ValidateCouponResponse | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Payment method
  const [payMethod, setPayMethod] = useState("upi");

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Load saved addresses when user is logged in
  useEffect(() => {
    if (!user) return;
    addressesService.getAll().then((apiAddresses) => {
      const addresses: Address[] = apiAddresses.map((a) => ({
        id: a.id,
        name: a.name,
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        line1: [a.line1, a.line2].filter(Boolean).join(", "),
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      }));
      setSavedAddresses(addresses);
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (def) {
        setSelectedAddressId(def.id);
        setForm((f) => ({
          ...f,
          fullName: def.fullName || f.fullName,
          phone: def.phone || f.phone,
          line1: def.line1,
          city: def.city,
          state: def.state,
          pincode: def.pincode,
        }));
      }
    }).catch(() => {/* non-fatal */});
  }, [user]);

  // ---- Totals ----
  const totals = cartTotals(items);
  const discount = couponResult?.discount ?? 0;
  const freeShipping = couponResult?.freeShipping ?? false;
  const shipping = freeShipping ? 0 : totals.shipping;
  const total = Math.max(0, totals.subtotal - discount + shipping);

  // ---- Validation ----
  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!form.line1.trim()) e.line1 = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "PIN code must be 6 digits.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ---- Coupon ----
  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    try {
      const result = await couponsService.validate({
        code,
        orderAmount: totals.subtotal,
      });
      setCouponResult(result);
      toast.success(`${result.coupon.code} applied — ${result.coupon.label}`);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : `"${code}" is not a valid code.`;
      toast.error(msg);
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  }

  // ---- Save address then checkout ----
  async function getOrCreateAddressId(): Promise<string> {
    // If the user selected a saved address, use it
    if (selectedAddressId) return selectedAddressId;

    // Otherwise save the form values as a new address
    const created = await addressesService.create({
      name: form.fullName,
      label: "Home",
      fullName: form.fullName,
      phone: form.phone,
      line1: form.line1,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    });
    return created.id;
  }

  // ---- Submit ----
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Ensure Razorpay SDK is loaded
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setSubmitting(false);
        return;
      }

      // 2. Get / create address
      const addressId = await getOrCreateAddressId();

      // 3. Create phonex order
      const apiOrder = await ordersService.checkout({
        addressId,
        couponCode: couponResult?.coupon.code,
      });

      // 4. Create Razorpay payment order
      const razorpayOrder = await paymentsService.create(apiOrder.id);

      // 5. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzpKey =
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
          razorpayOrder.keyId;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay({
          key: rzpKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          order_id: razorpayOrder.razorpayOrderId,
          name: "phoneX",
          description: `Order ${orderNumber(apiOrder.id)}`,
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#7c3aed" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 6. Verify signature on the backend
              await paymentsService.verify({
                orderId: apiOrder.id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () =>
              reject(new Error("Payment cancelled. Your order is saved — you can retry from Orders.")),
          },
        });
        rzp.open();
      });

      // 7. Order confirmed — update local state and redirect
      const frontendOrder = toFrontendOrder(apiOrder);
      place(frontendOrder);
      await clear();

      toast.success("Order confirmed!", {
        description: `Order ${orderNumber(apiOrder.id)} is being prepared.`,
      });
      router.replace(`/orders/${apiOrder.id}?placed=1`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Checkout failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Empty cart guard ----
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

      <form
        onSubmit={submit}
        noValidate
        className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]"
        id="checkout-form"
      >
        <div className="space-y-10">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <section
              aria-labelledby="saved-addr-heading"
              className="rounded-xl border bg-card p-6"
            >
              <h2 id="saved-addr-heading" className="font-heading font-semibold">
                Saved addresses
              </h2>
              <RadioGroup
                value={selectedAddressId ?? ""}
                onValueChange={(id) => {
                  setSelectedAddressId(id);
                  const addr = savedAddresses.find((a) => a.id === id);
                  if (addr) {
                    setForm((f) => ({
                      ...f,
                      fullName: addr.fullName,
                      phone: addr.phone,
                      line1: addr.line1,
                      city: addr.city,
                      state: addr.state,
                      pincode: addr.pincode,
                    }));
                  }
                }}
                className="mt-4 space-y-2"
              >
                {savedAddresses.map((addr) => (
                  <Label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                      selectedAddressId === addr.id
                        ? "border-transparent ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <RadioGroupItem value={addr.id} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">
                        {addr.label} — {addr.fullName}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {addr.line1}, {addr.city}, {addr.state} —{" "}
                        {addr.pincode}
                      </span>
                    </span>
                  </Label>
                ))}
                <Label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4">
                  <RadioGroupItem
                    value=""
                    onClick={() => setSelectedAddressId(null)}
                  />
                  <span className="text-sm font-medium">
                    Enter a new address
                  </span>
                </Label>
              </RadioGroup>
            </section>
          )}

          {/* Contact + address form */}
          {!selectedAddressId && (
            <section
              aria-labelledby="addr-heading"
              className="rounded-xl border bg-card p-6"
            >
              <h2
                id="addr-heading"
                className="font-heading font-semibold"
              >
                Delivery details
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  id="fullName"
                  label="Full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  error={errors.fullName}
                  disabled={submitting}
                />
                <Field
                  id="phone"
                  label="Phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  error={errors.phone}
                  disabled={submitting}
                />
                <div className="sm:col-span-2">
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    error={errors.email}
                    disabled={submitting}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="line1"
                    label="Address"
                    autoComplete="street-address"
                    placeholder="Flat, street, landmark"
                    value={form.line1}
                    onChange={(e) =>
                      setForm({ ...form, line1: e.target.value })
                    }
                    error={errors.line1}
                    disabled={submitting}
                  />
                </div>
                <Field
                  id="city"
                  label="City"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  error={errors.city}
                  disabled={submitting}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    id="state"
                    label="State"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    error={errors.state}
                    disabled={submitting}
                  />
                  <Field
                    id="pincode"
                    label="PIN code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                    error={errors.pincode}
                    disabled={submitting}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Payment method */}
          <section
            aria-labelledby="pay-heading"
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <h2 id="pay-heading" className="font-heading font-semibold">
                Payment
              </h2>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" /> Secured by
                Razorpay
              </span>
            </div>
            <RadioGroup
              value={payMethod}
              onValueChange={setPayMethod}
              className="mt-4 space-y-3"
            >
              {(
                [
                  ["upi", "UPI", "GPay, PhonePe, Paytm"],
                  ["card", "Card", "Visa, Mastercard, RuPay"],
                  ["netbanking", "Netbanking", "All major banks"],
                ] as const
              ).map(([value, label, hint]) => (
                <Label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                    payMethod === value
                      ? "border-transparent ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <RadioGroupItem value={value} />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {hint}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>
        </div>

        {/* Order summary sidebar */}
        <aside
          aria-label="Order summary"
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">Order summary</h2>

            <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3 text-sm">
                  {i.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={i.thumb}
                      alt=""
                      className="size-12 rounded-md border object-cover"
                    />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-md border bg-secondary text-xs font-semibold text-muted-foreground">
                      {i.qty}×
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {i.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.subtitle}
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {formatINR(i.unitPrice * i.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />

            {/* Coupon */}
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-10 uppercase"
                disabled={couponLoading || submitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={couponLoading || submitting}
              >
                {couponLoading ? "…" : "Apply"}
              </Button>
            </div>
            {couponResult && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                {couponResult.coupon.code} — {couponResult.coupon.label}
              </p>
            )}

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <dt>Discount ({couponResult?.coupon.code})</dt>
                  <dd className="tabular-nums">−{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">
                  {shipping === 0 ? "Free" : formatINR(shipping)}
                </dd>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(total)}</dd>
              </div>
            </dl>

            <Button
              type="submit"
              size="lg"
              form="checkout-form"
              className="mt-6 h-12 w-full text-base"
              disabled={submitting}
            >
              <Lock />
              {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
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
