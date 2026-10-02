"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { TAGS, type Project, type TagId } from "@/lib/data";
import { tagColor } from "@/components/Tag";
import {
  deleteProjectAction,
  reorderProjectsAction,
  setProjectActiveAction,
} from "@/app/admin/actions";
import SortableGrid from "@/components/admin/SortableGrid";
import { Spinner, Switch, buttonClass, cx, inputClass, toast } from "@/components/admin/ui";

type StatusFilter = "all" | "live" | "hidden";
type OptimisticOp =
  | { type: "active"; slug: string; active: boolean }
  | { type: "delete"; slug: string };

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";
const THUMB_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px";

export default function ProjectsDashboard({
  projects,
  storageMode,
}: {
  projects: Project[];
  storageMode: "blob" | "fs";
}) {
  const [optimistic, applyOptimistic] = useOptimistic(projects, (state: Project[], op: OptimisticOp) => {
    if (op.type === "delete") return state.filter((p) => p.slug !== op.slug);
    return state.map((p) => (p.slug === op.slug ? { ...p, active: op.active } : p));
  });
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tags, setTags] = useState<Set<TagId>>(new Set());

  const [reordering, setReordering] = useState(false);
  const [draft, setDraft] = useState<Project[]>([]);
  const [savingOrder, startSavingOrder] = useTransition();

  const counts = useMemo(
    () => ({
      all: optimistic.length,
      live: optimistic.filter((p) => p.active).length,
      hidden: optimistic.filter((p) => !p.active).length,
    }),
    [optimistic]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return optimistic.filter((p) => {
      if (status === "live" && !p.active) return false;
      if (status === "hidden" && p.active) return false;
      if (tags.size && !p.tags.some((t) => tags.has(t))) return false;
      if (q && !`${p.title} ${p.slug} ${p.tool} ${p.date}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [optimistic, query, status, tags]);

  const filtersActive = query.trim() !== "" || status !== "all" || tags.size > 0;

  function toggleTag(id: TagId) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setActive(p: Project, active: boolean) {
    startTransition(async () => {
      applyOptimistic({ type: "active", slug: p.slug, active });
      const res = await setProjectActiveAction(p.slug, active);
      if (!res.ok) toast(res.error, "error");
      else toast(active ? `“${p.title}” is now live` : `“${p.title}” is now hidden`, "success");
    });
  }

  function remove(p: Project) {
    if (!confirm(`Delete “${p.title}” and all of its images? This can't be undone.`)) return;
    startTransition(async () => {
      applyOptimistic({ type: "delete", slug: p.slug });
      const res = await deleteProjectAction(p.slug);
      if (!res.ok) toast(res.error, "error");
      else toast(`Deleted “${p.title}”`, "success");
    });
  }

  function startReorder() {
    setDraft(optimistic);
    setReordering(true);
  }

  function saveOrder() {
    startSavingOrder(async () => {
      const res = await reorderProjectsAction(draft.map((p) => p.slug));
      if (!res.ok) {
        toast(res.error, "error");
        return;
      }
      toast("Order saved", "success");
      setReordering(false);
    });
  }

  return (
    <div>
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-caslon text-[28px] font-bold leading-none sm:text-[32px]">Projects</h1>
          <p className="mt-1.5 font-archivo text-[13px] text-ink/55">
            {counts.live} live · {counts.hidden} hidden
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!reordering && (
            <button type="button" onClick={startReorder} className={buttonClass("secondary")}>
              <ReorderIcon /> Reorder
            </button>
          )}
          {!reordering && (
            <Link href="/admin/projects/new" className={buttonClass("primary")}>
              <span aria-hidden className="text-[18px] leading-none">+</span> New project
            </Link>
          )}
        </div>
      </div>

      {reordering ? (
        <ReorderView
          items={draft}
          onChange={setDraft}
          onCancel={() => setReordering(false)}
          onSave={saveOrder}
          saving={savingOrder}
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative lg:w-72">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                aria-label="Search projects"
                className={cx(inputClass, "pl-9")}
              />
            </div>
            <div
              role="radiogroup"
              aria-label="Filter by visibility"
              className="inline-flex w-full rounded-[8px] border border-ink/10 bg-white/55 p-1 sm:w-auto"
            >
              {(["all", "live", "hidden"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={status === s}
                  onClick={() => setStatus(s)}
                  className={cx(
                    "flex-1 rounded-[6px] px-3 py-1.5 font-archivo text-[13px] capitalize transition-colors sm:flex-none",
                    status === s ? "bg-ink text-bg" : "text-ink/65 hover:text-ink"
                  )}
                >
                  {s} <span className="opacity-60">{counts[s]}</span>
                </button>
              ))}
            </div>
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              {TAGS.map((t) => {
                const on = tags.has(t.id);
                const color = tagColor(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTag(t.id)}
                    className="shrink-0 rounded-full border px-3 py-1 font-archivo text-[13px] font-medium transition-colors"
                    style={
                      on
                        ? { backgroundColor: color, borderColor: color, color: "#fff" }
                        : { borderColor: color, color }
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filtersActive && (
            <p className="mt-3 font-archivo text-[13px] text-ink/55">
              Showing {filtered.length} of {optimistic.length}.{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-ink"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setTags(new Set());
                }}
              >
                Clear filters
              </button>
            </p>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <EmptyState hasProjects={optimistic.length > 0} />
          ) : (
            <ul className={cx(GRID, "mt-5")}>
              {filtered.map((p, i) => (
                <li key={p.slug}>
                  <ProjectCard
                    project={p}
                    priority={i < 4}
                    onToggle={(v) => setActive(p, v)}
                    onDelete={() => remove(p)}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-10 font-archivo text-[12px] text-ink/40">
            Storage: {storageMode === "blob" ? "Vercel Blob" : "local files (data/ and public/)"} · The order
            here is the order on the site.
          </p>
        </>
      )}
    </div>
  );
}

function ProjectCard({
  project: p,
  priority,
  onToggle,
  onDelete,
}: {
  project: Project;
  priority?: boolean;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  const cover = p.images[0];
  return (
    <article
      className={cx(
        "group flex h-full flex-col overflow-hidden rounded-[10px] border bg-white/60 transition-shadow hover:shadow-[0_2px_14px_rgba(23,23,23,0.08)]",
        p.active ? "border-ink/10" : "border-dashed border-ink/20"
      )}
    >
      <Link href={`/admin/projects/${p.slug}/edit`} className="block focus-visible:outline-none">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
          {cover && (
            <Image
              src={cover.src}
              alt=""
              fill
              sizes={THUMB_SIZES}
              priority={priority}
              className={cx(
                "object-cover transition-[transform,opacity,filter] duration-300 group-hover:scale-[1.02]",
                !p.active && "opacity-55 grayscale"
              )}
            />
          )}
          {!p.active && (
            <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-archivo text-[11px] text-bg">
              hidden
            </span>
          )}
          {p.images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 font-archivo text-[11px] text-bg">
              {p.images.length} images
            </span>
          )}
        </div>
        <div className="px-3 pt-2.5">
          <h3 className="line-clamp-2 font-archivo text-[14px] font-medium leading-snug group-hover:underline sm:text-[15px]">
            {p.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5">
            {p.tags.map((t) => (
              <span
                key={t}
                title={t}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tagColor(t) }}
              />
            ))}
            {p.date && <span className="truncate font-archivo text-[12px] text-ink/50">{p.date}</span>}
          </div>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-2.5 pt-3">
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={p.active}
            onChange={onToggle}
            label={p.active ? `Hide “${p.title}” from the site` : `Show “${p.title}” on the site`}
          />
          <span className="font-archivo text-[12px] text-ink/60">{p.active ? "Live" : "Hidden"}</span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete “${p.title}”`}
          className="-mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-ink/40 transition-colors hover:bg-tag-comission/10 hover:text-tag-comission"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}

function ReorderView({
  items,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  items: Project[];
  onChange: (next: Project[]) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-5">
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-bg/90 px-4 py-3 backdrop-blur sm:top-16 sm:-mx-6 sm:px-6">
        <p className="font-archivo text-[13px] text-ink/65">
          <span className="hidden sm:inline">Drag projects into the order they should appear on the site.</span>
          <span className="sm:hidden">Press and hold, then drag.</span>
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} disabled={saving} className={buttonClass("ghost")}>
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={saving} className={buttonClass("primary")}>
            {saving && <Spinner />} Save order
          </button>
        </div>
      </div>
      <SortableGrid
        items={items}
        getId={(p) => p.slug}
        onReorder={onChange}
        className={cx(GRID, "mt-5")}
        renderItem={(p, i, { isDragging }) => (
          <div
            className={cx(
              "overflow-hidden rounded-[10px] border bg-white/80 transition-shadow",
              isDragging ? "border-ink/40 shadow-xl" : "border-ink/10",
              !p.active && "opacity-60"
            )}
          >
            <div className="pointer-events-none relative aspect-[4/3] bg-ink/5">
              {p.images[0] && (
                <Image src={p.images[0].src} alt="" fill sizes={THUMB_SIZES} className="object-cover" draggable={false} />
              )}
              <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-archivo text-[11px] text-bg">
                {i + 1}
              </span>
            </div>
            <p className="truncate px-3 py-2 font-archivo text-[13px] font-medium">{p.title}</p>
          </div>
        )}
      />
    </div>
  );
}

function EmptyState({ hasProjects }: { hasProjects: boolean }) {
  return (
    <div className="mt-6 rounded-[10px] border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-caslon text-[20px] font-bold">
        {hasProjects ? "No projects match these filters" : "No projects yet"}
      </p>
      {!hasProjects && (
        <Link href="/admin/projects/new" className={buttonClass("primary", "mt-4")}>
          Add the first project
        </Link>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 6h12M8 6V4.5A1 1 0 0 1 9 3.5h2a1 1 0 0 1 1 1V6m-6.5 0 .7 9.6a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4L14.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReorderIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 4 4 7m3-3 3 3M7 4v12m6 0-3-3m3 3 3-3m-3 3V4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
