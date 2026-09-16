import ProjectForm from "@/components/admin/ProjectForm";
import { createProjectAction } from "@/app/admin/actions";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-caslon text-[26px] font-bold">add project</h1>
      <ProjectForm action={createProjectAction} submitLabel="Create project" />
    </div>
  );
}
