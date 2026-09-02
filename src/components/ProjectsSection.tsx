"use client";

import { useMemo, useState } from "react";
import { PROJECTS, TAGS, type TagId } from "@/lib/data";
import Tag from "@/components/Tag";
import ProjectCard from "@/components/ProjectCard";
import { SECTION_X } from "@/lib/ui";
import { distributeColumns } from "@/lib/masonry";

export default function ProjectsSection() {
  const [active, setActive] = useState<Set<TagId>>(new Set());

  const filtered = useMemo(() => {
    if (active.size === 0) return PROJECTS;
    return PROJECTS.filter((p) => p.tags.some((t) => active.has(t)));
  }, [active]);

  const mobileColumns = useMemo(() => distributeColumns(filtered, 2), [filtered]);
  const desktopColumns = useMemo(() => distributeColumns(filtered, 3), [filtered]);

  function toggle(id: TagId) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section id="projects" className="border-b border-gray py-10 md:py-16">
      <div className={SECTION_X}>
        <h2 className="hover-roman font-caslon text-[30px] font-bold md:text-[40px]">
          projects
        </h2>

        <div className="mt-6 flex flex-wrap gap-3 md:mt-8 md:gap-4">
          {TAGS.map((t) => (
            <Tag
              key={t.id}
              id={t.id}
              label={t.label}
              as="button"
              active={active.has(t.id)}
              onClick={() => toggle(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: 2 columns, flush to the frame edges */}
      <div className="mt-6 flex gap-[15px] md:hidden">
        {mobileColumns.map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-[15px]">
            {col.map((project) => (
              <ProjectCard key={project.slug} project={project} noBottomMargin />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: 3 columns, 30px gutters and 30px margin to the frame */}
      <div className={`mt-10 hidden gap-[30px] md:flex ${SECTION_X}`}>
        {desktopColumns.map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-[30px]">
            {col.map((project) => (
              <ProjectCard key={project.slug} project={project} noBottomMargin />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
