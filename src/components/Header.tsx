"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onProject = pathname?.startsWith("/projects/");

  function handleLogoClick(e: React.MouseEvent) {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById("frame-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNavClick(e: React.MouseEvent, id: string) {
    setOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between px-5 md:h-[92px] md:px-[30px]">
      <Link
        href="/"
        onClick={handleLogoClick}
        className="hover-roman font-caslon text-[30px] font-bold leading-none md:text-[40px]"
      >
        júlia ferreira
      </Link>

      {/* Desktop nav */}
      <nav className="hidden items-center gap-10 md:flex">
        <Link
          href="/#projects"
          onClick={(e) => handleNavClick(e, "projects")}
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
          onClick={(e) => handleNavClick(e, "about-me")}
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
        <nav className="fixed left-3 right-3 top-[84px] bottom-3 z-20 flex flex-col gap-2 bg-bg px-5 py-8 md:hidden">
          <Link
            href="/#projects"
            onClick={(e) => handleNavClick(e, "projects")}
            className="hover-roman font-caslon py-2 text-[16px] font-bold"
          >
            projects
          </Link>
          <Link
            href="/#about-me"
            onClick={(e) => handleNavClick(e, "about-me")}
            className="hover-roman font-caslon py-2 text-[16px] font-bold"
          >
            about me
          </Link>
        </nav>
      )}
    </header>
  );
}
