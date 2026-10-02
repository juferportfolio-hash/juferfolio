"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { cx } from "@/components/admin/ui";

const NAV = [
  { href: "/admin", label: "Projects", match: (p: string) => p === "/admin" || p.startsWith("/admin/projects") },
  { href: "/admin/site", label: "Site texts", match: (p: string) => p.startsWith("/admin/site") },
];

export default function AdminHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:gap-6 sm:px-6">
        <Link href="/admin" className="shrink-0 font-caslon text-[20px] font-bold italic leading-none sm:text-[22px]">
          júlia <span className="font-archivo text-[12px] font-medium not-italic text-ink/50">admin</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-1" aria-label="Admin">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "whitespace-nowrap rounded-[6px] px-2.5 py-1.5 font-archivo text-[14px] transition-colors sm:px-3",
                  active ? "bg-ink text-bg" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="hidden rounded-[6px] px-3 py-1.5 font-archivo text-[14px] text-ink/70 hover:bg-ink/5 hover:text-ink sm:inline-flex"
          >
            View site ↗
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-[6px] px-2.5 py-1.5 font-archivo text-[14px] text-ink/70 hover:bg-ink/5 hover:text-ink sm:px-3"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
