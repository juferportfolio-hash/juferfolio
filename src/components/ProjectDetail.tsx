"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/data";
import { TAGS } from "@/lib/data";
import Tag from "@/components/Tag";

interface Props {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

export default function ProjectDetail({ project, prev, next }: Props) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(true);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 1300);
    return () => clearTimeout(t);
  }, [project.slug]);

  function goPrev() {
    if (prev) router.push(`/projects/${prev.slug}`);
  }
  function goNext() {
    if (next) router.push(`/projects/${next.slug}`);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  const multi = project.images.length > 1;

  return (
    <div className="flex h-full flex-col overflow-hidden md:flex-row">
      {/* Image area */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {multi ? (
          <div className="flex h-full flex-col items-center gap-[15px] overflow-y-auto pt-14 md:gap-[30px] md:p-[30px]">
            {project.images.map((img, i) => (
              <Image
                key={i}
                src={img.src}
                alt={`${project.title} — image ${i + 1}`}
                width={img.width}
                height={img.height}
                className="w-full flex-shrink-0 object-contain md:h-auto md:w-auto md:max-h-full md:max-w-full"
                priority={i === 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center pt-14 md:p-[30px]">
            <Image
              src={project.images[0].src}
              alt={project.title}
              width={project.images[0].width}
              height={project.images[0].height}
              className="max-h-full max-w-full object-contain"
              priority
            />
          </div>
        )}

        {/* Desktop prev/next click zones */}
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

        {/* Mobile swipe hint */}
        {showHint && (prev || next) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex animate-fade-in-out items-center justify-center gap-8 md:hidden">
            {prev && <span className="font-archivo text-2xl text-gray">&#8592;</span>}
            {next && <span className="font-archivo text-2xl text-gray">&#8594;</span>}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="relative flex h-[42%] shrink-0 flex-col overflow-y-auto border-t border-gray p-6 md:h-full md:w-[33%] md:border-l md:border-t-0 md:p-10">
        <Link
          href="/#projects"
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-gray text-ink md:right-8 md:top-8"
        >
          <span className="text-lg leading-none">&times;</span>
        </Link>

        <div className="mt-auto pt-16 md:pt-0">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-archivo text-[14px] font-light text-gray">Date</p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {project.date}
              </p>
            </div>
            <div>
              <p className="font-archivo text-[14px] font-light text-gray">Time period</p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {project.time}
              </p>
            </div>
            <div>
              <p className="font-archivo text-[14px] font-light text-gray">Tools</p>
              <p className="font-archivo text-[14px] font-medium md:text-[17px]">
                {project.tool}
              </p>
            </div>
          </div>

          <p className="mt-6 font-archivo text-[14px] font-medium leading-[1.32] md:text-[17px]">
            {project.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.tags.map((t) => {
              const tag = TAGS.find((x) => x.id === t)!;
              return <Tag key={t} id={tag.id} label={tag.label} variant="filled" />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
