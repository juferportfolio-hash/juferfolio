import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectAny } from "@/lib/store";
import { addProjectImagesAction, updateProjectAction } from "@/app/admin/actions";
import ProjectForm from "@/components/admin/ProjectForm";
import ImageManager from "@/components/admin/ImageManager";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectAny(slug);
  if (!project) notFound();

  const boundUpdate = updateProjectAction.bind(null, slug);
  const boundAddImages = addProjectImagesAction.bind(null, slug);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-caslon text-[26px] font-bold">{project.title}</h1>
        <Link href={`/projects/${project.slug}`} target="_blank" className="font-archivo text-[13px] underline">
          view on site
        </Link>
      </div>

      <ProjectForm action={boundUpdate} project={project} submitLabel="Save changes" />

      <hr className="my-8 border-gray" />

      <h2 className="font-caslon text-[20px] font-bold">
        images ({project.images.length}/20)
      </h2>
      <ImageManager slug={project.slug} images={project.images} addAction={boundAddImages} />

      <hr className="my-8 border-gray" />

      <DeleteProjectButton slug={project.slug} title={project.title} />
    </div>
  );
}
