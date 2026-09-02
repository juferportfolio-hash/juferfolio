"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onProject = pathname?.startsWith("/projects/");

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-gray bg-bg px-5 md:h-[92px] md:px-[30px]">
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="hover-roman font-caslon text-[30px] font-bold leading-none md:text-[40px]"
      >
        júlia ferreira
      </Link>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-10 md:flex">
        <Link
          href="/#projects"
          className="hover-roman font-caslon text-[20px] font-bold"
        >
          {onProject ? (
            <>
              <span className="mr-3 align-middle">•</span>
              projects
              <span className="ml-3 align-middle">•</span>
            </>
          ) : (
            "projects"
          )}
        </Link>
        <Link
          href="/#about-me"
          className="hover-roman font-caslon text-[20px] font-bold"
        >
          about me
        </Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 flex-col items-end justify-center gap-[5px] md:hidden"
      >
        <span
          className={`h-px w-full bg-ink transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
        />
        <span className={`h-px w-full bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
        <span
          className={`h-px w-full bg-ink transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
        />
      </button>

      {open && (
        <nav className="fixed inset-x-0 top-[72px] bottom-0 z-20 flex flex-col gap-2 bg-bg px-5 py-8 md:hidden">
          <Link
            href="/#projects"
            onClick={() => setOpen(false)}
            className="hover-roman font-caslon py-2 text-[16px] font-bold"
          >
            projects
          </Link>
          <Link
            href="/#about-me"
            onClick={() => setOpen(false)}
            className="hover-roman font-caslon py-2 text-[16px] font-bold"
          >
            about me
          </Link>
        </nav>
      )}
    </header>
  );
}
