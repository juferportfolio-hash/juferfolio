import type { Project } from "@/lib/data";
import { TAGS } from "@/lib/data";
import Tag from "@/components/Tag";
import ProjectImageSwiper from "@/components/ProjectImageSwiper";

interface Props {
  project: Project;
  prev: Project | null;
  next: Project | null;
}

export default function ProjectDetail({ project, prev, next }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden md:flex-row">
      <ProjectImageSwiper project={project} prev={prev} next={next} />

      {/* Info panel — unchanged, no animation/drag of its own */}
      <div className="relative flex h-[42%] shrink-0 flex-col overflow-y-auto border-t border-gray px-6 pb-6 pt-4 md:h-full md:w-[33%] md:border-l md:border-t-0 md:p-10">
        <div className="md:mt-auto">
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
