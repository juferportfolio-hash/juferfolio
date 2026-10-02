"use client";

import { usePathname } from "next/navigation";
import Frame from "@/components/Frame";
import Header from "@/components/Header";

/**
 * The public site lives inside a fixed, framed viewport with its own
 * scroller. The admin section gets the plain document instead: normal page
 * scrolling, full width on phones, and room for sticky toolbars.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="fixed inset-3 flex flex-col">
      <Header />
      <Frame>{children}</Frame>
    </div>
  );
}
