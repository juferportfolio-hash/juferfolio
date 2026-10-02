import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[360px]">
        <h1 className="font-caslon text-[32px] font-bold italic leading-none text-ink">júlia ferreira</h1>
        <p className="mt-2 font-archivo text-[14px] text-ink/55">Sign in to manage the portfolio.</p>
        <LoginForm />
      </div>
    </main>
  );
}
