import { notFound } from "next/navigation";
import { PROJECTS, getProject, getAdjacentProjects } from "@/lib/data";
import ProjectDetail from "@/components/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacentProjects(slug);

  return <ProjectDetail project={project} prev={prev} next={next} />;
}
