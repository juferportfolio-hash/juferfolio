import { notFound } from "next/navigation";
import { getProjectAny, STORAGE_MODE } from "@/lib/store";
import ProjectEditor from "@/components/admin/ProjectEditor";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectAny(slug);
  if (!project) notFound();

  // Keyed by slug so switching between projects never reuses editor state.
  return <ProjectEditor key={project.slug} project={project} storageMode={STORAGE_MODE} />;
}
