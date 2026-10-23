"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useDeviceCatalog } from "@/lib/stores/device-catalog-store";
import { categoriesService } from "@/lib/services/categories.service";
import type { ApiCategory, ApiProduct } from "@/lib/api-types";
import { productsService } from "@/lib/services/products.service";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [skins, setSkins] = useState<ApiProduct[]>([]);

  const brands = useDeviceCatalog((s) => s.brands);
  const models = useDeviceCatalog((s) => s.models);
  const loadCatalog = useDeviceCatalog((s) => s.load);

  // Load browse data lazily when the dialog opens
  useEffect(() => {
    if (!open) return;
    loadCatalog();
    categoriesService
      .getAll()
      .then((items) => setCategories(items.filter((c) => c.isActive !== false)))
      .catch(() => {
        /* dialogs degrade to links below */
      });
  }, [open, loadCatalog]);

  // Debounce the query before hitting the products API
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (debounced.length < 2) { setSkins([]); return; }
    let cancelled = false;
    productsService
      .search(debounced, { limit: 6 })
      .then((res) => { if (!cancelled) setSkins(res.items ?? []); })
      .catch(() => { if (!cancelled) setSkins([]); });
    return () => { cancelled = true; };
  }, [debounced]);

  const query = q.trim().toLowerCase();
  const matchedModels = useMemo(() => {
    if (query.length < 2) return [];
    return models
      .filter((m) => m.name.toLowerCase().includes(query) || m.brandName.toLowerCase().includes(query))
      .slice(0, 6);
  }, [models, query]);
  const matchedBrands = useMemo(() => {
    if (query.length < 2) return [];
    return brands.filter((b) => b.name.toLowerCase().includes(query));
  }, [brands, query]);
  const matchedCategories = useMemo(() => {
    if (query.length < 2) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, query]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search phoneX">
      <CommandInput
        placeholder="Search devices, brands, skins…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {q && (
          <>
            <CommandEmpty>No results for “{q}”.</CommandEmpty>
            {matchedModels.length > 0 && (
              <CommandGroup heading="Devices">
                {matchedModels.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`device ${m.name}`}
                    onSelect={() => go(`/devices/${m.brandSlug}/${m.slug}`)}
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">{m.brandName} · {m.kind}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {skins.length > 0 && (
              <CommandGroup heading="Skins">
                {skins.map((s) => (
                  <CommandItem key={s.id} value={`skin ${s.name}`} onSelect={() => go(`/products/${s.slug}`)}>
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {matchedBrands.length > 0 && (
              <CommandGroup heading="Brands">
                {matchedBrands.map((b) => (
                  <CommandItem key={b.id} value={`brand ${b.name}`} onSelect={() => go(`/devices/${b.slug}`)}>
                    {b.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {matchedCategories.length > 0 && (
              <CommandGroup heading="Designs">
                {matchedCategories.map((c) => (
                  <CommandItem key={c.id} value={`design ${c.name}`} onSelect={() => go(`/designs/${c.slug}`)}>
                    {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandItem onSelect={() => go(`/search?q=${encodeURIComponent(q)}`)}>
              See all results for “{q}”
            </CommandItem>
          </>
        )}
        {!q && (
          <>
            <CommandGroup heading="Browse">
              <CommandItem onSelect={() => go("/customize")}>Customize your own skin</CommandItem>
              <CommandItem onSelect={() => go("/shop")}>Shop all skins</CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchLink() {
  return (
    <Link href="/search" className="sr-only">
      Search
    </Link>
  );
}
