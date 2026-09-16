import Link from "next/link";
import { getAllProjects } from "@/lib/store";
import AdminProjectGrid from "@/components/admin/AdminProjectGrid";

export default function AdminDashboard() {
  const projects = getAllProjects();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-caslon text-[26px] font-bold">projects ({projects.length})</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-[6px] bg-ink px-5 py-2 font-archivo text-[14px] font-medium text-bg"
        >
          + add project
        </Link>
      </div>

      <AdminProjectGrid projects={projects} />
    </div>
  );
}
