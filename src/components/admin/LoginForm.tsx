"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        autoFocus
        className="border border-gray bg-transparent p-3 font-archivo text-[14px] focus:outline-none"
      />
      {state?.error && (
        <p className="font-archivo text-[13px] text-tag-comission">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[6px] bg-ink px-6 py-2 font-archivo text-[14px] font-medium text-bg disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
