(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ProjectImageSwiper.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProjectImageSwiper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const SWIPE_THRESHOLD_RATIO = 0.22; // fraction of the frame's width that counts as "committed"
const SNAP_MS = 220; // drag-commit / snap-back transition
// The on-open hint nudge: a shorter travel distance (rather than a shorter
// duration) is what keeps it feeling brief — a fast/short-duration slide
// over a full-size peek reads as a glitch on mobile, while a slower glide
// over a smaller distance still finishes quickly and looks deliberate.
const NUDGE_MS = 320;
const NUDGE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const NUDGE_PEEK_PX = 22;
// filter: drop-shadow (see .image-shadow in globals.css) rather than a
// Tailwind box-shadow class — these images are object-contain inside a
// frame that can be taller/wider than the picture itself, and box-shadow
// would trace that frame instead of the actual visible image.
const IMAGE_SHADOW = "image-shadow";
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
let skipNextMountNudgeTimer = null;
// Raw viewport coordinates from the most recent mousemove, kept across
// remounts for the same reason skipNextMountNudge is module-scoped: this
// component's instance doesn't survive a prev/next navigation, but the
// user's mouse hasn't actually moved, so there's no new event to tell the
// next instance where the cursor is.
let lastClientPos = null;
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
    skipNextMountNudgeTimer = setTimeout(()=>{
        skipNextMountNudge = false;
    }, 2000);
}
function ProjectImageSwiper({ project, prev, next }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [offset, setOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [transition, setTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("none");
    const prevRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(prev);
    const nextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(next);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            prevRef.current = prev;
            nextRef.current = next;
        }
    }["ProjectImageSwiper.useEffect"], [
        prev,
        next
    ]);
    const dragging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const startX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const startY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const axisLocked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const navigating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Desktop prev/next cursor: position is pushed straight to the DOM via
    // this ref (not React state) since mousemove fires far too often for a
    // state-driven re-render every event; only the arrow's direction, which
    // changes rarely, goes through state.
    const cursorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cursorDirRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [cursorDir, setCursorDir] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const overCloseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // The multi-image list's own scrollable element — see the wheel-forwarding
    // effect below for why this needs a direct handle to it.
    const listRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Reset instantly on every project change. This is the React-endorsed
    // "adjust state during render when a prop changes" pattern (comparing
    // against a bit of state that tracks the previous slug) rather than a
    // setState-in-effect, which cascades an extra render for no benefit here.
    const [trackedSlug, setTrackedSlug] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(project.slug);
    if (trackedSlug !== project.slug) {
        setTrackedSlug(project.slug);
        setTransition("none");
        setOffset(0);
    }
    // Ref mutation (not state), so doing it in an effect — rather than during
    // the render-time reset above — is required, not just stylistic.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            navigating.current = false;
        }
    }["ProjectImageSwiper.useEffect"], [
        project.slug
    ]);
    // Runs a brief peek-nudge toward whichever neighbors exist, but only once:
    // when a project is opened fresh from the overview page (this component's
    // first mount). Moving to the next/previous project keeps this same
    // component instance mounted (only the props change), so this effect does
    // NOT re-run on every prev/next navigation — the mount-only `[]` deps below
    // are intentional, not an oversight. It's also mobile-only: on desktop the
    // click-zone cursors already show the direction, and the nudge would just
    // be a distracting flicker for a mouse user.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            if (skipNextMountNudge) return;
            if (("TURBOPACK compile-time value", "object") === "undefined" || window.innerWidth >= 768) return;
            let cancelled = false;
            const timers = [];
            let t = 250;
            const step = {
                "ProjectImageSwiper.useEffect.step": (value)=>{
                    timers.push(window.setTimeout({
                        "ProjectImageSwiper.useEffect.step": ()=>{
                            if (cancelled) return;
                            setTransition(`transform ${NUDGE_MS}ms ${NUDGE_EASE}`);
                            setOffset(value);
                        }
                    }["ProjectImageSwiper.useEffect.step"], t));
                    t += NUDGE_MS + 80;
                }
            }["ProjectImageSwiper.useEffect.step"];
            if (nextRef.current) step(-NUDGE_PEEK_PX);
            step(0);
            if (prevRef.current) step(NUDGE_PEEK_PX);
            if (prevRef.current) step(0);
            return ({
                "ProjectImageSwiper.useEffect": ()=>{
                    cancelled = true;
                    timers.forEach(clearTimeout);
                }
            })["ProjectImageSwiper.useEffect"];
        }
    }["ProjectImageSwiper.useEffect"], []);
    // Native (non-passive) touch listeners so preventDefault() can actually
    // suppress vertical scroll while a horizontal swipe is in progress.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            function handleStart(e) {
                if (navigating.current) return;
                dragging.current = true;
                axisLocked.current = null;
                startX.current = e.touches[0].clientX;
                startY.current = e.touches[0].clientY;
                setTransition("none");
            }
            function handleMove(e) {
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
                setOffset({
                    "ProjectImageSwiper.useEffect.handleEnd": (current)=>{
                        if (current <= -threshold && nextRef.current) {
                            const slug = nextRef.current.slug;
                            navigating.current = true;
                            markInternalNavigation();
                            setTransition(`transform ${SNAP_MS}ms ease-out`);
                            window.setTimeout({
                                "ProjectImageSwiper.useEffect.handleEnd": ()=>router.push(`/projects/${slug}`)
                            }["ProjectImageSwiper.useEffect.handleEnd"], SNAP_MS);
                            return -width;
                        }
                        if (current >= threshold && prevRef.current) {
                            const slug = prevRef.current.slug;
                            navigating.current = true;
                            markInternalNavigation();
                            setTransition(`transform ${SNAP_MS}ms ease-out`);
                            window.setTimeout({
                                "ProjectImageSwiper.useEffect.handleEnd": ()=>router.push(`/projects/${slug}`)
                            }["ProjectImageSwiper.useEffect.handleEnd"], SNAP_MS);
                            return width;
                        }
                        setTransition(`transform ${SNAP_MS}ms ease-out`);
                        return 0;
                    }
                }["ProjectImageSwiper.useEffect.handleEnd"]);
            }
            el.addEventListener("touchstart", handleStart, {
                passive: true
            });
            el.addEventListener("touchmove", handleMove, {
                passive: false
            });
            el.addEventListener("touchend", handleEnd, {
                passive: true
            });
            el.addEventListener("touchcancel", handleEnd, {
                passive: true
            });
            return ({
                "ProjectImageSwiper.useEffect": ()=>{
                    el.removeEventListener("touchstart", handleStart);
                    el.removeEventListener("touchmove", handleMove);
                    el.removeEventListener("touchend", handleEnd);
                    el.removeEventListener("touchcancel", handleEnd);
                }
            })["ProjectImageSwiper.useEffect"];
        }
    }["ProjectImageSwiper.useEffect"], [
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            function handleWheel(e) {
                const list = listRef.current;
                if (!list) return;
                list.scrollTop += e.deltaY;
            }
            el.addEventListener("wheel", handleWheel, {
                passive: true
            });
            return ({
                "ProjectImageSwiper.useEffect": ()=>el.removeEventListener("wheel", handleWheel)
            })["ProjectImageSwiper.useEffect"];
        }
    }["ProjectImageSwiper.useEffect"], []);
    // Desktop-only: follows the mouse with an inverted-color arrow instead of
    // a native OS cursor icon (a static bitmap can't sample the pixels beneath
    // it — see .cursor-invert in globals.css for why this has to be a real
    // element). Attached once per mount, same as the touch listeners; prev/next
    // are read from the refs kept in sync above so this doesn't need to
    // re-attach when they change.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProjectImageSwiper.useEffect": ()=>{
            const el = containerRef.current;
            if (!el) return;
            if (("TURBOPACK compile-time value", "object") === "undefined" || window.innerWidth < 768) return;
            function updateAt(clientX, clientY) {
                const cursorEl = cursorRef.current;
                if (!el || !cursorEl) return;
                // Hovering the close button: its own default pointer cursor already
                // signals "clickable" — the nav arrow would just sit on top of it.
                if (overCloseRef.current) {
                    cursorEl.style.opacity = "0";
                    return;
                }
                const rect = el.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                const dir = x < rect.width / 2 ? "left" : "right";
                const active = dir === "left" ? prevRef.current : nextRef.current;
                if (!active) {
                    cursorEl.style.opacity = "0";
                    return;
                }
                cursorEl.style.opacity = "1";
                cursorEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                if (cursorDirRef.current !== dir) {
                    cursorDirRef.current = dir;
                    setCursorDir(dir);
                }
            }
            function handleMove(e) {
                lastClientPos = {
                    x: e.clientX,
                    y: e.clientY
                };
                updateAt(e.clientX, e.clientY);
            }
            function handleLeave() {
                if (cursorRef.current) cursorRef.current.style.opacity = "0";
            }
            el.addEventListener("mousemove", handleMove);
            el.addEventListener("mouseleave", handleLeave);
            // Show the cursor right away if the mouse is already sitting over the
            // frame from before this instance mounted (e.g. it was just over the
            // right half when its "next project" button triggered this navigation,
            // and hasn't moved since) — otherwise it stays invisible until the next
            // real mousemove, which might not come for a while.
            if (lastClientPos) {
                const rect = el.getBoundingClientRect();
                const withinFrame = lastClientPos.x >= rect.left && lastClientPos.x <= rect.right && lastClientPos.y >= rect.top && lastClientPos.y <= rect.bottom;
                if (withinFrame) updateAt(lastClientPos.x, lastClientPos.y);
            }
            return ({
                "ProjectImageSwiper.useEffect": ()=>{
                    el.removeEventListener("mousemove", handleMove);
                    el.removeEventListener("mouseleave", handleLeave);
                }
            })["ProjectImageSwiper.useEffect"];
        }
    }["ProjectImageSwiper.useEffect"], []);
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
    return(// An explicit opaque background + isolate: mix-blend-mode only computes
    // against real painted pixels in the same isolated group. Without a
    // background of its own here, the gutter around a non-full-bleed image
    // was relying on whatever happens to show through from way up the page
    // tree — wherever that isn't a solid opaque layer in reach, the cursor
    // just paints its raw white instead of inverting. Isolating this frame
    // with its own bg-bg guarantees a real backdrop everywhere in it.
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative isolate min-h-0 flex-1 overflow-hidden bg-bg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-full w-full",
                style: {
                    transform: `translateX(calc(-100% + ${offset}px))`,
                    transition
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full w-full shrink-0",
                        children: prev && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CoverSlide, {
                            project: prev
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                            lineNumber: 358,
                            columnNumber: 58
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                        lineNumber: 358,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full w-full shrink-0",
                        children: multi ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: listRef,
                            className: "flex h-full flex-col items-center gap-[15px] overflow-y-auto px-[10px] pt-14 md:gap-[30px] md:p-[30px]",
                            children: project.images.map((img, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: img.src,
                                    alt: `${project.title} — image ${i + 1}`,
                                    width: img.width,
                                    height: img.height,
                                    className: `w-full flex-shrink-0 object-contain md:h-auto md:w-auto md:max-h-full md:max-w-full ${IMAGE_SHADOW}`,
                                    priority: i === 0
                                }, i, false, {
                                    fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                                    lineNumber: 367,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                            lineNumber: 362,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-full w-full items-center justify-center px-[10px] pt-14 md:p-[30px]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: project.images[0].src,
                                alt: project.title,
                                width: project.images[0].width,
                                height: project.images[0].height,
                                className: `max-h-full max-w-full object-contain ${IMAGE_SHADOW}`,
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                                lineNumber: 380,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                        lineNumber: 360,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full w-full shrink-0",
                        children: next && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CoverSlide, {
                            project: next
                        }, void 0, false, {
                            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                            lineNumber: 392,
                            columnNumber: 58
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                lineNumber: 351,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/#projects",
                "aria-label": "Close",
                onMouseEnter: ()=>{
                    overCloseRef.current = true;
                    if (cursorRef.current) cursorRef.current.style.opacity = "0";
                },
                onMouseLeave: ()=>{
                    overCloseRef.current = false;
                },
                className: "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray bg-bg/80 text-ink md:right-6 md:top-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-lg leading-none",
                    children: "×"
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                    lineNumber: 408,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                lineNumber: 396,
                columnNumber: 7
            }, this),
            prev && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                "aria-label": "Previous project",
                onClick: goPrev,
                className: "absolute inset-y-0 left-0 hidden w-1/2 cursor-none md:block"
            }, void 0, false, {
                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                lineNumber: 414,
                columnNumber: 9
            }, this),
            next && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                "aria-label": "Next project",
                onClick: goNext,
                className: "absolute inset-y-0 right-0 hidden w-1/2 cursor-none md:block"
            }, void 0, false, {
                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                lineNumber: 421,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: cursorRef,
                "aria-hidden": true,
                className: "cursor-invert pointer-events-none absolute left-0 top-0 z-20 hidden md:block",
                style: {
                    opacity: 0
                },
                children: cursorDir && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavArrow, {
                    direction: cursorDir
                }, void 0, false, {
                    fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                    lineNumber: 440,
                    columnNumber: 23
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ProjectImageSwiper.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
        lineNumber: 347,
        columnNumber: 5
    }, this));
}
_s(ProjectImageSwiper, "sjqDzuPt7YllASvc2bNEHeYc12s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ProjectImageSwiper;
function NavArrow({ direction }) {
    const points = direction === "left" ? "4.4 0 5.08 .73 2.01 3.59 13.34 3.59 13.34 4.59 2.01 4.59 5.08 7.45 4.4 8.18 0 4.09" : "8.94 0 8.26 .73 11.33 3.59 0 3.59 0 4.59 11.33 4.59 8.26 7.45 8.94 8.18 13.34 4.09";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "34",
        height: "21",
        viewBox: "0 0 13.34 8.18",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
            fill: "#ffffff",
            points: points
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
            lineNumber: 453,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
        lineNumber: 452,
        columnNumber: 5
    }, this);
}
_c1 = NavArrow;
function CoverSlide({ project }) {
    const cover = project.images[0];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-full w-full items-center justify-center px-[10px] pt-14 md:p-[30px]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            src: cover.src,
            alt: project.title,
            width: cover.width,
            height: cover.height,
            className: `max-h-full max-w-full object-contain opacity-90 ${IMAGE_SHADOW}`
        }, void 0, false, {
            fileName: "[project]/src/components/ProjectImageSwiper.tsx",
            lineNumber: 462,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ProjectImageSwiper.tsx",
        lineNumber: 461,
        columnNumber: 5
    }, this);
}
_c2 = CoverSlide;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ProjectImageSwiper");
__turbopack_context__.k.register(_c1, "NavArrow");
__turbopack_context__.k.register(_c2, "CoverSlide");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_ProjectImageSwiper_tsx_0a2e_i3._.js.map