"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/data";

interface Props {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

const SWIPE_THRESHOLD_RATIO = 0.22; // fraction of the frame's width that counts as "committed"
const SNAP_MS = 220; // drag-commit / snap-back transition
const NUDGE_MS = 160; // on-open hint nudge — quicker and smoother than a commit snap
const NUDGE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const HINT_PEEK_PX = 40;
const IMAGE_SHADOW = "shadow-[0_8px_30px_rgba(0,0,0,0.05)]"; // very light, subtle

// Module-scope, not React state: this needs to survive the swiper actually
// remounting on every navigation (Next re-renders the whole page subtree per
// route, it doesn't preserve this component's instance across prev/next the
// way an SPA might), so it can't live in props/state. Set right before any
// prev/next navigation *this component itself* initiates, and read (without
// being cleared as a side effect of reading — see markInternalNavigation)
// by the mount effect below — every other way of landing on a project page
// (a ProjectCard link from the overview, a direct URL, browser back/forward)
// leaves it unset, so the nudge plays.
let skipNextMountNudge = false;
let skipNextMountNudgeTimer: ReturnType<typeof setTimeout> | null = null;

// Marks the *next* mount as internal navigation, then un-marks it shortly
// after. The un-mark is deliberately on a timer rather than "clear it the
// first time an effect reads it" — dev-mode Strict Mode mounts every
// component twice (mount, cleanup, mount again) specifically to catch
// effects that aren't idempotent, and a read-then-clear flag would tell the
// truth to the first of those two mounts and a lie to the second. A timer
// comfortably longer than a route transition takes clears it exactly once,
// independent of how many times (1 in production, 2 in dev) the effect runs.
function markInternalNavigation() {
  skipNextMountNudge = true;
  if (skipNextMountNudgeTimer) clearTimeout(skipNextMountNudgeTimer);
  skipNextMountNudgeTimer = setTimeout(() => {
    skipNextMountNudge = false;
  }, 2000);
}

/**
 * The image side of a project detail page: the current project's image(s),
 * plus a peek of the previous/next project's cover on either side so a swipe
 * (or, on desktop, the click zones) has something to reveal. Handles:
 *  - live 1:1 drag-follow while swiping, with the neighbor peeking in
 *  - a brief on-open nudge hinting that there's more to either side
 *  - committing to prev/next past a threshold, snapping back otherwise
 * The info/description panel (rendered by the caller) is untouched by any of
 * this — it keeps its previous, non-animated behavior.
 */
export default function ProjectImageSwiper({ project, prev, next }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(0);
  const [transition, setTransition] = useState("none");

  const prevRef = useRef(prev);
  const nextRef = useRef(next);
  useEffect(() => {
    prevRef.current = prev;
    nextRef.current = next;
  }, [prev, next]);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axisLocked = useRef<"x" | "y" | null>(null);
  const navigating = useRef(false);

  // Reset instantly on every project change. This is the React-endorsed
  // "adjust state during render when a prop changes" pattern (comparing
  // against a bit of state that tracks the previous slug) rather than a
  // setState-in-effect, which cascades an extra render for no benefit here.
  const [trackedSlug, setTrackedSlug] = useState(project.slug);
  if (trackedSlug !== project.slug) {
    setTrackedSlug(project.slug);
    setTransition("none");
    setOffset(0);
  }

  // Ref mutation (not state), so doing it in an effect — rather than during
  // the render-time reset above — is required, not just stylistic.
  useEffect(() => {
    navigating.current = false;
  }, [project.slug]);

  // Runs a brief peek-nudge toward whichever neighbors exist, but only once:
  // when a project is opened fresh from the overview page (this component's
  // first mount). Moving to the next/previous project keeps this same
  // component instance mounted (only the props change), so this effect does
  // NOT re-run on every prev/next navigation — the mount-only `[]` deps below
  // are intentional, not an oversight. It's also mobile-only: on desktop the
  // click-zone cursors already show the direction, and the nudge would just
  // be a distracting flicker for a mouse user.
  useEffect(() => {
    if (skipNextMountNudge) return;
    if (typeof window === "undefined" || window.innerWidth >= 768) return;

    let cancelled = false;
    const timers: number[] = [];
    let t = 180;
    const step = (value: number) => {
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setTransition(`transform ${NUDGE_MS}ms ${NUDGE_EASE}`);
          setOffset(value);
        }, t)
      );
      t += 150;
    };

    if (nextRef.current) step(-HINT_PEEK_PX);
    step(0);
    if (prevRef.current) step(HINT_PEEK_PX);
    if (prevRef.current) step(0);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Native (non-passive) touch listeners so preventDefault() can actually
  // suppress vertical scroll while a horizontal swipe is in progress.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleStart(e: TouchEvent) {
      if (navigating.current) return;
      dragging.current = true;
      axisLocked.current = null;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      setTransition("none");
    }

    function handleMove(e: TouchEvent) {
      if (!dragging.current || navigating.current) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (axisLocked.current === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axisLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      // A vertical drag (scrolling a multi-image project) is left alone.
      if (axisLocked.current === "y") return;

      e.preventDefault();
      let clamped = dx;
      if (dx > 0 && !prevRef.current) clamped = dx * 0.25;
      if (dx < 0 && !nextRef.current) clamped = dx * 0.25;
      setOffset(clamped);
    }

    function handleEnd() {
      if (!dragging.current || !el) return;
      dragging.current = false;
      const wasHorizontal = axisLocked.current === "x";
      axisLocked.current = null;
      if (!wasHorizontal) return;

      const width = el.clientWidth || 1;
      const threshold = width * SWIPE_THRESHOLD_RATIO;

      setOffset((current) => {
        if (current <= -threshold && nextRef.current) {
          const slug = nextRef.current.slug;
          navigating.current = true;
          markInternalNavigation();
          setTransition(`transform ${SNAP_MS}ms ease-out`);
          window.setTimeout(() => router.push(`/projects/${slug}`), SNAP_MS);
          return -width;
        }
        if (current >= threshold && prevRef.current) {
          const slug = prevRef.current.slug;
          navigating.current = true;
          markInternalNavigation();
          setTransition(`transform ${SNAP_MS}ms ease-out`);
          window.setTimeout(() => router.push(`/projects/${slug}`), SNAP_MS);
          return width;
        }
        setTransition(`transform ${SNAP_MS}ms ease-out`);
        return 0;
      });
    }

    el.addEventListener("touchstart", handleStart, { passive: true });
    el.addEventListener("touchmove", handleMove, { passive: false });
    el.addEventListener("touchend", handleEnd, { passive: true });
    el.addEventListener("touchcancel", handleEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleStart);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchend", handleEnd);
      el.removeEventListener("touchcancel", handleEnd);
    };
  }, [router]);

  function goPrev() {
    if (!prev) return;
    markInternalNavigation();
    router.push(`/projects/${prev.slug}`);
  }
  function goNext() {
    if (!next) return;
    markInternalNavigation();
    router.push(`/projects/${next.slug}`);
  }

  const multi = project.images.length > 1;

  return (
    <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(-100% + ${offset}px))`,
          transition,
        }}
      >
        <div className="h-full w-full shrink-0">{prev && <CoverSlide project={prev} />}</div>

        <div className="h-full w-full shrink-0">
          {multi ? (
            <div className="flex h-full flex-col items-center gap-[15px] overflow-y-auto px-[10px] pt-14 md:gap-[30px] md:p-[30px]">
              {project.images.map((img, i) => (
                <Image
                  key={i}
                  src={img.src}
                  alt={`${project.title} — image ${i + 1}`}
                  width={img.width}
                  height={img.height}
                  className={`w-full flex-shrink-0 object-contain md:h-auto md:w-auto md:max-h-full md:max-w-full ${IMAGE_SHADOW}`}
                  priority={i === 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center px-[10px] pt-14 md:p-[30px]">
              <Image
                src={project.images[0].src}
                alt={project.title}
                width={project.images[0].width}
                height={project.images[0].height}
                className={`max-h-full max-w-full object-contain ${IMAGE_SHADOW}`}
                priority
              />
            </div>
          )}
        </div>

        <div className="h-full w-full shrink-0">{next && <CoverSlide project={next} />}</div>
      </div>

      {/* Close — docked to the image frame, not the description panel */}
      <Link
        href="/#projects"
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray bg-bg/80 text-ink md:right-6 md:top-6"
      >
        <span className="text-lg leading-none">&times;</span>
      </Link>

      {/* Desktop prev/next click zones, with a cursor that always points the
          direction that half of the frame will take you. */}
      {prev && (
        <button
          aria-label="Previous project"
          onClick={goPrev}
          className="cursor-prev absolute inset-y-0 left-0 hidden w-1/2 md:block"
        />
      )}
      {next && (
        <button
          aria-label="Next project"
          onClick={goNext}
          className="cursor-next absolute inset-y-0 right-0 hidden w-1/2 md:block"
        />
      )}

    </div>
  );
}

function CoverSlide({ project }: { project: Project }) {
  const cover = project.images[0];
  return (
    <div className="flex h-full w-full items-center justify-center px-[10px] pt-14 md:p-[30px]">
      <Image
        src={cover.src}
        alt={project.title}
        width={cover.width}
        height={cover.height}
        className={`max-h-full max-w-full object-contain opacity-90 ${IMAGE_SHADOW}`}
      />
    </div>
  );
}
