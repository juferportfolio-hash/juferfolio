export default function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 border border-gray">
      <div
        id="frame-scroll"
        className="frame-scroll flex h-full w-full flex-col overflow-y-auto overflow-x-hidden"
      >
        {children}
      </div>
    </div>
  );
}
