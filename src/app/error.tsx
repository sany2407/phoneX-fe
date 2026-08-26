"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x grid place-items-center py-24 text-center">
      <div className="max-w-md">
        <h1 className="text-headline-lg">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          An unexpected error occurred. Try again — if it keeps happening,
          we&apos;re already on it.
        </p>
        <Button size="lg" className="mt-8 h-12" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
