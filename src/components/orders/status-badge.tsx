import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  Pending: "bg-secondary text-foreground",
  Confirmed: "bg-electric-soft text-primary",
  Designing: "bg-electric-soft text-primary",
  Printing: "bg-electric-soft text-primary",
  Packed: "bg-electric-soft text-primary",
  Shipped: "bg-secondary text-foreground",
  Delivered: "bg-primary text-primary-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      className={`border-transparent ${STATUS_TONE[status] ?? ""}`}
      variant="secondary"
    >
      {status}
    </Badge>
  );
}
