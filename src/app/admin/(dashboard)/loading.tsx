export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-40 rounded-[6px] bg-ink/10" />
      <div className="mt-2 h-4 w-28 rounded-[6px] bg-ink/5" />
      <div className="mt-6 h-11 w-full max-w-md rounded-[6px] bg-ink/5" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[10px] border border-ink/5">
            <div className="aspect-[4/3] bg-ink/[0.07]" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded bg-ink/[0.07]" />
              <div className="h-3 w-1/3 rounded bg-ink/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
