"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DeviceCard } from "@/components/device/device-card";
import type { ApiBrand, ApiDeviceModel } from "@/lib/api-types";
import { cn } from "@/lib/utils";

/** A model paired with the brand it belongs to (resolved on the server). */
export type DeviceModelItem = { model: ApiDeviceModel; brand: ApiBrand };

/** Models per page. */
export const MODELS_PER_PAGE = 20;

type Props = {
  items: DeviceModelItem[];
  /** Brand pages group by device type; category pages are already one type. */
  groupByType?: boolean;
};

function Grid({ items }: { items: DeviceModelItem[] }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ model, brand }) => (
        <li key={model.id}>
          <DeviceCard brand={brand} model={model} />
        </li>
      ))}
    </ul>
  );
}

export function DeviceModelGrid({ items, groupByType = false }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / MODELS_PER_PAGE));
  // Clamp so a stale page index can never render an empty grid.
  const current = Math.min(page, totalPages);
  const start = (current - 1) * MODELS_PER_PAGE;
  const visible = items.slice(start, start + MODELS_PER_PAGE);

  const goTo = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Group the visible slice only — a device type can continue onto the next
  // page, which is fine and keeps the grouping honest.
  const groups = new Map<string, DeviceModelItem[]>();
  if (groupByType) {
    for (const item of visible) {
      const key = item.model.deviceType?.name ?? "Other";
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
  }

  return (
    <div>
      {groupByType ? (
        [...groups.entries()].map(([typeName, list]) => (
          <section key={typeName} aria-label={typeName} className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">{typeName}s</h2>
            <Grid items={list} />
          </section>
        ))
      ) : (
        <Grid items={visible} />
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-12 flex flex-col items-center gap-3"
        >
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {start + 1}–{Math.min(start + MODELS_PER_PAGE, items.length)}
            </span>{" "}
            of {items.length} models
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              disabled={current === 1}
              className={cn(
                "press inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium",
                current === 1
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-muted"
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </button>

            <span className="px-2 text-sm text-muted-foreground">
              Page {current} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current === totalPages}
              className={cn(
                "press inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium",
                current === totalPages
                  ? "cursor-not-allowed opacity-40"
                  : "hover:bg-muted"
              )}
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
