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
    // Rounding lives on the image itself, not an overflow-hidden wrapper —
    // a wrapper that clips would also clip the drop-shadow filter below.
    <Link
      href={`/projects/${project.slug}`}
      className={`block ${noBottomMargin ? "" : "mb-[15px] md:mb-[30px]"}`}
    >
      <Image
        src={cover.src}
        alt={project.title}
        width={cover.width}
        height={cover.height}
        sizes="(max-width: 768px) 50vw, 33vw"
        className="image-shadow h-auto w-full rounded-[7px]"
      />
    </Link>
  );
}
