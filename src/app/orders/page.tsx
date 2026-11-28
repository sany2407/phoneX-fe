"use client";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shop/empty-state";
import { StatusBadge } from "@/components/orders/status-badge";
import { useOrders } from "@/lib/stores/orders-store";
import { formatDate, formatINR, orderNumber } from "@/lib/utils";

export default function OrdersPage() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);

  if (!hydrated) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Your Orders</h1>
      <p className="mt-1 text-muted-foreground">Track every skin from studio to doorstep.</p>

      {orders.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={PackageOpen}
            title="No orders yet"
            description="When you place an order it will appear here with live tracking."
            actionLabel="Start shopping"
            actionHref="/shop"
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="press block rounded-xl border bg-card p-5 transition-shadow duration-300 ease-out hover:border-transparent hover:shadow-card-hover"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold tracking-wide">{orderNumber(order.id)}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                  <p className="truncate text-muted-foreground">
                    {order.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}
                  </p>
                  <p className="shrink-0 font-semibold tabular-nums">{formatINR(order.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" size="lg" className="mt-10 h-12" asChild>
        <Link href="/shop">Continue shopping</Link>
      </Button>
    </div>
  );
}
