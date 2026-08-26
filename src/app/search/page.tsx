"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { DeviceCard } from "@/components/device/device-card";
import { EmptyState } from "@/components/shop/empty-state";
import { search } from "@/lib/api";

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);

  const results = q ? search(q) : null;
  const total = results
    ? results.devices.length + results.brands.length + results.categories.length + results.skins.length
    : 0;

  return (
    <>
      <form
        className="relative mt-8 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input.trim())}`);
        }}
        role="search"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search devices, skins, brands…"
          className="h-12 pl-4 text-[15px]"
          aria-label="Search phoneX"
          autoFocus
        />
      </form>

      {!results ? (
        <p className="mt-10 text-muted-foreground">
          Type something to search — try “iPhone 17” or “anime”.
        </p>
      ) : total === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={SearchX}
            title={`No results for “${q}”`}
            description="Check the spelling or browse the catalogue — we probably have something close."
            actionLabel="Browse designs"
            actionHref="/designs"
          />
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          <Group title="Devices" count={results.devices.length} hidden={results.devices.length === 0}>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3">
              {results.devices.map((model) => (
                <li key={model.id}>
                  <DeviceCard model={model} />
                </li>
              ))}
            </ul>
          </Group>

          <Group title="Skins" count={results.skins.length} hidden={results.skins.length === 0}>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {results.skins.map((skin) => (
                <ProductCard key={skin.id} skin={skin} />
              ))}
            </div>
          </Group>

          <Group
            title="Brands & designs"
            count={results.brands.length + results.categories.length}
            hidden={results.brands.length + results.categories.length === 0}
          >
            <ul className="flex flex-wrap gap-2.5">
              {results.brands.map((b) => (
                <li key={b.id}>
                  <Button variant="outline" asChild>
                    <Link href={`/devices/${b.slug}`}>{b.name}</Link>
                  </Button>
                </li>
              ))}
              {results.categories.map((c) => (
                <li key={c.id}>
                  <Button variant="outline" asChild>
                    <Link href={`/designs/${c.slug}`}>{c.name}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </Group>
        </div>
      )}
    </>
  );
}

function Group({
  title,
  count,
  hidden,
  children,
}: {
  title: string;
  count: number;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return null;
  return (
    <section aria-label={`${title} results`}>
      <h2 className="text-lg font-semibold tracking-tight">
        {title} <span className="ml-1 text-sm font-normal text-muted-foreground">{count}</span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <div className="container-x py-10 lg:py-14">
      <h1 className="text-headline-lg">Search</h1>
      <Suspense fallback={<div className="mt-8 h-12 max-w-xl animate-pulse rounded-lg bg-muted" />}>
        <Results />
      </Suspense>
    </div>
  );
}
