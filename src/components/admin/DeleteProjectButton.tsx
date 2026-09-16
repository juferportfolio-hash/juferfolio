"use client";

import { deleteProjectAction } from "@/app/admin/actions";

export default function DeleteProjectButton({ slug, title }: { slug: string; title?: string }) {
  const boundDelete = deleteProjectAction.bind(null, slug);

  return (
    <form
      action={boundDelete}
      onSubmit={(e) => {
        const label = title ? `“${title}”` : "this project";
        if (!confirm(`Delete ${label} and all of its images? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="font-archivo text-[13px] font-medium text-tag-comission underline"
      >
        delete project
      </button>
    </form>
  );
}
