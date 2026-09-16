"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TAGS, type Project, type TagId } from "@/lib/data";
import { toggleActiveAction } from "@/app/admin/actions";
import Tag from "@/components/Tag";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export default function AdminProjectGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<TagId>>(new Set());

  function toggleTag(id: TagId) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery = q === "" || p.title.toLowerCase().includes(q) || p.slug.includes(q);
      const matchesTags = activeTags.size === 0 || p.tags.some((t) => activeTags.has(t));
      return matchesQuery && matchesTags;
    });
  }, [projects, query, activeTags]);

  const active = filtered.filter((p) => p.active);
  const inactive = filtered.filter((p) => !p.active);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
          className="border border-gray bg-transparent p-3 font-archivo text-[14px] focus:outline-none sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <Tag
              key={t.id}
              id={t.id}
              label={t.label}
              as="button"
              active={activeTags.has(t.id)}
              onClick={() => toggleTag(t.id)}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 font-archivo text-[13px] text-gray">
        {filtered.length} of {projects.length} project{projects.length === 1 ? "" : "s"}
      </p>

      <section className="mt-6">
        <h2 className="font-caslon text-[20px] font-bold">active ({active.length})</h2>
        {active.length === 0 ? (
          <p className="mt-3 font-archivo text-[13px] text-gray">No matching active projects.</p>
        ) : (
          <ProjectCardGrid projects={active} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-caslon text-[20px] font-bold">inactive ({inactive.length})</h2>
        {inactive.length === 0 ? (
          <p className="mt-3 font-archivo text-[13px] text-gray">No matching inactive projects.</p>
        ) : (
          <ProjectCardGrid projects={inactive} />
        )}
      </section>
    </div>
  );
}

function ProjectCardGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        const boundToggle = toggleActiveAction.bind(null, p.slug);
        return (
          <div key={p.slug} className="overflow-hidden rounded-[7px] border border-gray">
            <div className="relative aspect-[4/3] bg-black/5">
              {p.images[0] && (
                <Image src={p.images[0].src} alt={p.title} fill className="object-cover" />
              )}
              {!p.active && (
                <span className="absolute left-2 top-2 rounded bg-ink/80 px-2 py-1 font-archivo text-[11px] text-bg">
                  inactive
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="font-archivo text-[14px] font-medium">{p.title}</p>
              <p className="font-archivo text-[12px] text-gray">
                {p.images.length} image{p.images.length === 1 ? "" : "s"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.tags.map((t) => {
                  const tag = TAGS.find((x) => x.id === t);
                  if (!tag) return null;
                  return <Tag key={t} id={tag.id} label={tag.label} variant="filled" size="sm" />;
                })}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 font-archivo text-[13px]">
                <Link href={`/admin/projects/${p.slug}/edit`} className="underline">
                  edit
                </Link>
                <form action={boundToggle}>
                  <button type="submit" className="underline">
                    {p.active ? "set inactive" : "set active"}
                  </button>
                </form>
                <DeleteProjectButton slug={p.slug} title={p.title} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
