import ProjectEditor from "@/components/admin/ProjectEditor";
import { STORAGE_MODE } from "@/lib/store";

export default function NewProjectPage() {
  return <ProjectEditor storageMode={STORAGE_MODE} />;
}
