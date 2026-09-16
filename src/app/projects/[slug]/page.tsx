import { notFound } from "next/navigation";
import { getAdjacentProjects, getProject } from "@/lib/store";
import ProjectDetail from "@/components/ProjectDetail";

export const dynamic = "force-dynamic";

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacentProjects(slug);

  return <ProjectDetail project={project} prev={prev} next={next} />;
}
