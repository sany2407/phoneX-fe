"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Ban, Check, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/orders/status-badge";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useOrders } from "@/lib/stores/orders-store";
import { ORDER_STATUSES } from "@/lib/types";
import { formatDate, formatINR, orderNumber } from "@/lib/utils";

export function OrderDetailClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const cancel = useOrders((s) => s.cancel);

  const justPlaced = searchParams.get("placed") === "1";

  useEffect(() => {
    if (justPlaced && !sessionStorage.getItem(`toast-${id}`)) {
      sessionStorage.setItem(`toast-${id}`, "1");
      toast.success("Order confirmed — thank you!", {
        description: "We've emailed your receipt.",
      });
    }
  }, [justPlaced, id]);

  if (!hydrated) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto h-72 max-w-3xl animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="text-headline-lg">Order not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t find order <span className="font-mono">{orderNumber(id)}</span>.
        </p>
        <Button size="lg" className="mt-6 h-12" asChild>
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const cancelled = order.status === "Cancelled";
  const currentIdx = ORDER_STATUSES.indexOf(
    order.status as (typeof ORDER_STATUSES)[number]
  );

  return (
    <div className="container-x py-10 lg:py-14">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/orders"><ArrowLeft /> All orders</Link>
      </Button>

      {justPlaced && (
        <section
          aria-label="Order confirmed"
          className="mt-6 flex items-start gap-4 rounded-xl border border-primary/20 bg-electric-soft/60 p-6"
        >
          <PartyPopper className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-lg font-semibold">Order confirmed</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Thanks, {order.customer.fullName.split(" ")[0]}! Your order{" "}
              <strong className="text-foreground">{orderNumber(order.id)}</strong> is in our
              print queue. We&apos;ll email updates at {order.customer.email}.
            </p>
          </div>
        </section>
      )}

      <header className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-mono text-headline-lg tracking-wide">
            {orderNumber(order.id)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)} ·{" "}
            {order.items.reduce((n, i) => n + i.qty, 0)} items · {formatINR(order.total)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {!cancelled && order.status !== "Delivered" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancel(order.id);
                toast.success("Order cancelled. Any payment holds are released in 3–5 days.");
              }}
            >
              <Ban /> Cancel order
            </Button>
          )}
        </div>
      </header>

      {/* Timeline */}
      <section aria-labelledby="track-heading" className="mt-10 rounded-xl border bg-card p-6 sm:p-8">
        <h2 id="track-heading" className="font-heading font-semibold">
          {cancelled ? "Order cancelled" : "Tracking"}
        </h2>

        {!cancelled ? (
          <ol className="mt-8 grid gap-6 sm:grid-cols-7 sm:gap-2">
            {ORDER_STATUSES.map((status, i) => {
              const done = i < currentIdx;
              const active = i === currentIdx;
              return (
                <li key={status} className="flex items-center gap-3 sm:flex-col sm:text-center">
                  <span
                    aria-hidden="true"
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "bg-electric-soft text-primary ring-2 ring-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={`text-xs font-medium ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {status}
                  </span>
                  <span className="sr-only">
                    {active ? "current stage" : done ? "completed" : "upcoming"}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This order was cancelled{order.history.length > 0 ? ` on ${formatDate(order.history[order.history.length - 1].at)}` : ""}.
          </p>
        )}
        {!cancelled && (
          <p className="mt-8 text-xs leading-5 text-muted-foreground">
            Status updates appear here as your order moves through production
            and shipping.
          </p>
        )}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <section aria-labelledby="items-heading" className="rounded-xl border bg-card p-6">
          <h2 id="items-heading" className="font-heading font-semibold">Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item, i) => (
              <li key={i} className="flex gap-4">
                {item.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumb} alt="" className="size-14 rounded-lg border object-cover" />
                ) : (
                  <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold text-muted-foreground">
                    {item.qty}×
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.subtitle} · for {item.deviceName}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums">{formatINR(item.unitPrice * item.qty)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Summary + address */}
        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">Payment summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-primary">
                  <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                  <dd className="tabular-nums">−{formatINR(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">
                  {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
                </dd>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-base font-semibold">
                <dt>Total paid</dt>
                <dd className="tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-heading font-semibold">Delivery address</h2>
            <address className="mt-3 not-italic text-sm leading-6 text-muted-foreground">
              <strong className="block text-foreground">{order.customer.fullName}</strong>
              {order.customer.line1}
              <br />
              {order.customer.city}, {order.customer.state} {order.customer.pincode}
              <br />
              {order.customer.phone}
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
}
