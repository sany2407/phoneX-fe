import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="phoneX home"
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <span
        className={cn(
          "grid size-7 place-items-center rounded-md bg-primary font-heading text-sm font-bold text-primary-foreground",
          invert && "bg-electric"
        )}
        aria-hidden="true"
      >
        X
      </span>
      <span
        className={cn(
          "font-heading text-lg font-bold tracking-tight",
          invert ? "text-white" : "text-foreground"
        )}
      >
        phone<span className="text-primary">X</span>
      </span>
    </Link>
  );
}
