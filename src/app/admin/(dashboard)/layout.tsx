import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminHeader from "@/components/admin/AdminHeader";
import { Toaster } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Admin — Júlia Ferreira",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-6 pt-5 sm:px-6 sm:pt-8">{children}</main>
      <Toaster />
    </div>
  );
}
