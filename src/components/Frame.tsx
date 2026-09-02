export default function Frame({ children }: { children: React.ReactNode }) {
  // The border lives on this outer, non-scrolling box so it always wraps the
  // full width/height of the rectangle — putting the border directly on the
  // scrolling element instead lets the scrollbar's own width eat into the
  // content area, leaving section borders (e.g. Hero's bottom border) short
  // of the frame's right edge.
  return (
    <div className="min-h-0 flex-1 border border-gray">
      <div
        id="frame-scroll"
        className="frame-scroll h-full scroll-smooth overflow-y-auto overflow-x-hidden"
      >
        {children}
      </div>
    </div>
  );
}
