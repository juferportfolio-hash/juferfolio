import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/data";

export default function ProjectCard({
  project,
  noBottomMargin = false,
}: {
  project: Project;
  noBottomMargin?: boolean;
}) {
  const cover = project.images[0];
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`block overflow-hidden rounded-[7px] ${
        noBottomMargin ? "" : "mb-[15px] md:mb-[30px]"
      }`}
    >
      <Image
        src={cover.src}
        alt={project.title}
        width={cover.width}
        height={cover.height}
        sizes="(max-width: 768px) 50vw, 33vw"
        className="h-auto w-full"
      />
    </Link>
  );
}
