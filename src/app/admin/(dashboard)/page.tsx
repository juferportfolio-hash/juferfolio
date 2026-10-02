import { getAllProjects, STORAGE_MODE } from "@/lib/store";
import ProjectsDashboard from "@/components/admin/ProjectsDashboard";

export default async function AdminDashboard() {
  const projects = await getAllProjects();
  return <ProjectsDashboard projects={projects} storageMode={STORAGE_MODE} />;
}
