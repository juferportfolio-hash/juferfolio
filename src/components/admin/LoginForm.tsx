"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
import { Spinner, buttonClass, inputClass } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <label className="sr-only" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        autoFocus
        className={inputClass}
      />
      {state?.error && (
        <p role="alert" className="font-archivo text-[13px] text-tag-comission">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass("primary", "h-11")}>
        {pending && <Spinner />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
