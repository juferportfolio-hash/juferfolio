import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-caslon text-[28px] font-bold text-ink">júlia ferreira — admin</h1>
        <p className="mt-2 font-archivo text-[14px] text-gray">Sign in to manage the site.</p>
        <LoginForm />
      </div>
    </main>
  );
}
