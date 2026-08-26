"use client";

import { useMemo, useState } from "react";
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
import { getBrands, search } from "@/lib/api";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const data = useMemo(() => search(q), [q]);
  const brands = getBrands();

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
            {data.devices.length > 0 && (
              <CommandGroup heading="Devices">
                {data.devices.map((d) => (
                  <CommandItem
                    key={d.id}
                    value={`device ${d.name}`}
                    onSelect={() => go(`/devices/${brands.find((b) => b.id === d.brandId)?.slug}/${d.slug}`)}
                  >
                    <span className="font-medium">{d.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">{d.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.skins.length > 0 && (
              <CommandGroup heading="Skins">
                {data.skins.map((s) => (
                  <CommandItem key={s.id} value={`skin ${s.name}`} onSelect={() => go(`/products/${s.slug}`)}>
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.brands.length > 0 && (
              <CommandGroup heading="Brands">
                {data.brands.map((b) => (
                  <CommandItem key={b.id} value={`brand ${b.name}`} onSelect={() => go(`/devices/${b.slug}`)}>
                    {b.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {data.categories.length > 0 && (
              <CommandGroup heading="Designs">
                {data.categories.map((c) => (
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
            <CommandGroup heading="Popular devices">
              {[["apple", "iPhone 17 Pro"], ["samsung", "Galaxy S26 Ultra"], ["apple", "MacBook Air 13 M4"]].map(
                ([brandSlug, name]) => (
                  <CommandItem key={name} onSelect={() => go(`/devices/${brandSlug}/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)}>
                    {name}
                  </CommandItem>
                )
              )}
            </CommandGroup>
            <CommandGroup heading="Browse">
              <CommandItem onSelect={() => go("/customize")}>Customize your own skin</CommandItem>
              <CommandItem onSelect={() => go("/designs/anime")}>Anime skins</CommandItem>
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
