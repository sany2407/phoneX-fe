"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildCatalogHref } from "@/lib/catalog-query";

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["popular", "Popular"],
  ["price-asc", "Price: Low → High"],
  ["price-desc", "Price: High → Low"],
  ["rating", "Top rated"],
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = useCallback(
    (sort: string) => {
      router.replace(buildCatalogHref(pathname, searchParams, { sort }), {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="hidden sm:inline">Sort</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]" aria-label="Sort products">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function TypeTabs({ value }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs: [string | undefined, string][] = [
    [undefined, "All"],
    ["phone", "Phones"],
    ["laptop", "Laptops"],
  ];

  return (
    <div role="tablist" aria-label="Device type" className="flex rounded-lg border bg-muted/60 p-1">
      {tabs.map(([key, label]) => (
        <button
          key={label}
          role="tab"
          aria-selected={(value ?? undefined) === key}
          onClick={() =>
            router.replace(
              buildCatalogHref(pathname, searchParams, { type: key ?? null }),
              { scroll: false }
            )
          }
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            (value ?? undefined) === key
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
