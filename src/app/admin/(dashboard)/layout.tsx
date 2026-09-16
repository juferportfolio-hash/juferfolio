import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray px-5 py-4 md:px-[30px]">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-caslon text-[22px] font-bold">
            admin
          </Link>
          <nav className="flex items-center gap-4 font-archivo text-[14px]">
            <Link href="/admin" className="underline">
              projects
            </Link>
            <Link href="/admin/site" className="underline">
              site texts
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="font-archivo text-[14px] underline">
            view site
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="font-archivo text-[14px] underline">
              log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 md:px-[30px]">{children}</main>
    </div>
  );
}
