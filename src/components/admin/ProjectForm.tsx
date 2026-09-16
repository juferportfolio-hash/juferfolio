"use client";

import { useActionState } from "react";
import { TAGS, type Project } from "@/lib/data";
import type { FormState } from "@/app/admin/actions";

const inputClass =
  "border border-gray bg-transparent p-3 font-archivo text-[14px] focus:outline-none";
const labelClass = "flex flex-col gap-1";
const labelTextClass = "font-archivo text-[13px] text-gray";

export default function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  project?: Project;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex max-w-2xl flex-col gap-5">
      <label className={labelClass}>
        <span className={labelTextClass}>Title</span>
        <input name="title" defaultValue={project?.title} required className={inputClass} />
      </label>

      {!project && (
        <label className={labelClass}>
          <span className={labelTextClass}>
            URL slug (optional — generated from the title if left blank)
          </span>
          <input name="slug" placeholder="e.g. riverside-clearing" className={inputClass} />
        </label>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className={labelTextClass}>Tags</legend>
        <div className="flex flex-wrap gap-4">
          {TAGS.map((t) => (
            <label key={t.id} className="flex items-center gap-2 font-archivo text-[14px]">
              <input
                type="checkbox"
                name="tags"
                value={t.id}
                defaultChecked={project?.tags.includes(t.id)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          <span className={labelTextClass}>Date</span>
          <input name="date" defaultValue={project?.date} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Time period</span>
          <input name="time" defaultValue={project?.time} className={inputClass} />
        </label>
        <label className={labelClass}>
          <span className={labelTextClass}>Tools</span>
          <input name="tool" defaultValue={project?.tool} className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        <span className={labelTextClass}>Description</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={project?.description}
          className={inputClass}
        />
      </label>

      <label className="flex items-center gap-2 font-archivo text-[14px]">
        <input type="checkbox" name="active" defaultChecked={project?.active ?? true} />
        Visible on the live site
      </label>

      {!project && (
        <>
          <label className={labelClass}>
            <span className={labelTextClass}>
              Main image — shown docked at the top of the project
            </span>
            <input type="file" name="mainImage" accept="image/*" required />
          </label>
          <label className={labelClass}>
            <span className={labelTextClass}>
              Additional images — stacked below the main image (optional, up to 19 more)
            </span>
            <input type="file" name="images" accept="image/*" multiple />
          </label>
        </>
      )}

      {state?.error && (
        <p className="font-archivo text-[13px] text-tag-comission">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-[6px] bg-ink px-6 py-2 font-archivo text-[14px] font-medium text-bg disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
