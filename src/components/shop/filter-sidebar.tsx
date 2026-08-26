"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  buildCatalogHref,
  toggleInList,
} from "@/lib/catalog-query";
import { getCategories, getFinishes, getMaterials } from "@/lib/api";
import type { DeviceType } from "@/lib/types";
import { cn } from "@/lib/utils";

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-label-sm text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const PRICE_BANDS = [
  { value: "", label: "Any price" },
  { value: "500", label: "Under ₹500" },
  { value: "1000", label: "Under ₹1,000" },
  { value: "1500", label: "Under ₹1,500" },
];

export function FilterSidebar({ deviceType }: { deviceType?: DeviceType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      router.replace(buildCatalogHref(pathname, searchParams, patch), {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  const list = (key: string) =>
    (searchParams.get(key) ?? "").split(",").filter(Boolean);

  const categories = getCategories();
  const materials = getMaterials();
  const finishes = getFinishes();

  const activeCount =
    list("category").length +
    list("material").length +
    list("finish").length +
    (searchParams.get("maxPrice") ? 1 : 0) +
    (searchParams.get("rating") ? 1 : 0) +
    (searchParams.get("stock") === "1" ? 1 : 0);

  return (
    <form
      aria-label="Product filters"
      onSubmit={(e) => e.preventDefault()}
      className={cn("space-y-6")}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              for (const k of ["category", "material", "finish", "maxPrice", "rating", "stock", "page"])
                params.delete(k);
              router.replace(params.toString() ? `${pathname}?${params}` : pathname);
            }}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Separator />

      <Group title="Category">
        <div className="space-y-2.5">
          {categories.map((c) => (
            <Label key={c.id} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
              <Checkbox
                checked={list("category").includes(c.id)}
                onCheckedChange={() =>
                  update({
                    category: toggleInList(list("category"), c.id).join(",") || null,
                  })
                }
              />
              {c.name}
            </Label>
          ))}
        </div>
      </Group>

      <Separator />

      <Group title="Material">
        <div className="space-y-2.5">
          {materials.map((mt) => (
            <Label key={mt.id} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
              <Checkbox
                checked={list("material").includes(mt.id)}
                onCheckedChange={() =>
                  update({
                    material: toggleInList(list("material"), mt.id).join(",") || null,
                  })
                }
              />
              {mt.label}
            </Label>
          ))}
        </div>
      </Group>

      <Separator />

      <Group title="Finish">
        <div className="space-y-2.5">
          {finishes.map((f) => (
            <Label key={f.id} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal capitalize">
              <Checkbox
                checked={list("finish").includes(f.id)}
                onCheckedChange={() =>
                  update({
                    finish: toggleInList(list("finish"), f.id).join(",") || null,
                  })
                }
              />
              {f.label}
            </Label>
          ))}
        </div>
      </Group>

      <Separator />

      <Group title="Price">
        <RadioGroup
          value={searchParams.get("maxPrice") ?? ""}
          onValueChange={(v) => update({ maxPrice: v || null })}
        >
          {PRICE_BANDS.map((band) => (
            <Label key={band.value} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
              <RadioGroupItem value={band.value} />
              {band.label}
            </Label>
          ))}
        </RadioGroup>
      </Group>

      <Separator />

      <Group title="Rating">
        <RadioGroup
          value={searchParams.get("rating") ?? ""}
          onValueChange={(v) => update({ rating: v || null })}
        >
          {[
            ["4.5", "4.5 & above"],
            ["4", "4.0 & above"],
            ["", "Any rating"],
          ].map(([value, label]) => (
            <Label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
              <RadioGroupItem value={value} />
              {label}
            </Label>
          ))}
        </RadioGroup>
      </Group>

      <Separator />

      <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
        <Checkbox
          checked={searchParams.get("stock") === "1"}
          onCheckedChange={(checked) => update({ stock: checked ? "1" : null })}
        />
        In stock only
      </Label>
      {!deviceType && (
        <p className="sr-only">Filter by device type from the tabs above.</p>
      )}
    </form>
  );
}
