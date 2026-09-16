"use client";

import { useActionState } from "react";
import type { Site } from "@/lib/data";
import type { FormState } from "@/app/admin/actions";

const inputClass =
  "border border-gray bg-transparent p-3 font-archivo text-[14px] focus:outline-none";
const labelClass = "flex flex-col gap-1";
const labelTextClass = "font-archivo text-[13px] text-gray";

export default function SiteForm({
  action,
  site,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  site: Site;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-5">
      <label className={labelClass}>
        <span className={labelTextClass}>Site name</span>
        <input name="name" defaultValue={site.name} className={inputClass} />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>Hero — main text</span>
        <textarea name="heroLead" rows={3} defaultValue={site.heroLead} className={inputClass} />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>Hero — secondary text</span>
        <textarea
          name="heroSecondary"
          rows={2}
          defaultValue={site.heroSecondary}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>About me (one paragraph per line)</span>
        <textarea name="about" rows={6} defaultValue={site.about.join("\n")} className={inputClass} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span className={labelTextClass}>Phone</span>
          <input name="tel" defaultValue={site.contact.tel} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Email</span>
          <input name="email" defaultValue={site.contact.email} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Instagram URL</span>
          <input name="instagram" defaultValue={site.contact.instagram} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Behance URL</span>
          <input name="behance" defaultValue={site.contact.behance} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>LinkedIn URL</span>
          <input name="linkedin" defaultValue={site.contact.linkedin} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>
            CV (PDF)
            {site.contact.cvUrl && (
              <>
                {" — "}
                <a
                  href={site.contact.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  current file
                </a>
              </>
            )}
          </span>
          <input type="file" name="cvFile" accept="application/pdf" className={inputClass} />
        </label>
      </div>

      {state?.error && (
        <p className="font-archivo text-[13px] text-tag-comission">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-[6px] bg-ink px-6 py-2 font-archivo text-[14px] font-medium text-bg disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
