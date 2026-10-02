export default function EditorSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-20 rounded bg-ink/5" />
      <div className="mt-3 h-8 w-56 rounded-[6px] bg-ink/10" />
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <div className="rounded-[10px] border border-ink/5 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-square rounded-[10px] bg-ink/[0.07]" />
            ))}
          </div>
        </div>
        <div className="rounded-[10px] border border-ink/5 p-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="mb-5">
              <div className="h-3 w-16 rounded bg-ink/[0.07]" />
              <div className="mt-2 h-10 rounded-[6px] bg-ink/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
