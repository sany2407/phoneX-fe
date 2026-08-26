import { Suspense } from "react";

import { OrderDetailClient } from "@/components/orders/order-detail-client";

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-12">
          <div className="mx-auto h-72 max-w-3xl animate-pulse rounded-xl bg-muted" />
        </div>
      }
    >
      <OrderDetailClient />
    </Suspense>
  );
}
