export default function Loading() {
  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-1/2 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
