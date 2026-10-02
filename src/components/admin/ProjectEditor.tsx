"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TAGS, type Project } from "@/lib/data";
import { tagColor } from "@/components/Tag";
import { deleteProjectAction, saveProjectAction } from "@/app/admin/actions";
import type { StorageMode } from "@/lib/upload-client";
import ImageManager, { toImageItems, toProjectImages, type ImageItem } from "@/components/admin/ImageManager";
import {
  Field,
  SaveBar,
  Section,
  Spinner,
  StatusPill,
  Switch,
  buttonClass,
  cx,
  inputClass,
  toast,
  useSaveShortcut,
  useUnsavedChangesWarning,
  type SaveStatus,
} from "@/components/admin/ui";

function slugPreview(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "project"
  );
}

export default function ProjectEditor({
  project,
  storageMode,
}: {
  project?: Project;
  storageMode: StorageMode;
}) {
  const isNew = !project;
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [items, setItems] = useState<ImageItem[]>(() => toImageItems(project?.images ?? []));
  const [active, setActive] = useState(project?.active ?? true);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slugInput, setSlugInput] = useState("");
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();

  useUnsavedChangesWarning(dirty || items.some((i) => i.isNew));

  // Toast after being redirected here from "create".
  useEffect(() => {
    if (searchParams.get("created")) {
      toast("Project created", "success");
      router.replace(`/admin/projects/${project?.slug}/edit`, { scroll: false });
    }
  }, [searchParams, router, project?.slug]);

  const markDirty = () => {
    setDirty(true);
    setJustSaved(false);
    setError(null);
  };

  const uploading = items.some((i) => i.status === "uploading");
  const failed = items.some((i) => i.status === "error");

  const status: SaveStatus = saving
    ? "saving"
    : uploading
      ? "uploading"
      : dirty
        ? "dirty"
        : justSaved
          ? "saved"
          : "clean";

  function save() {
    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) return;
    if (uploading) {
      toast("Wait for the uploads to finish.", "error");
      return;
    }
    if (failed) {
      setError("Some images failed to upload — retry or remove them first.");
      return;
    }
    const images = toProjectImages(items);
    if (images.length === 0) {
      setError("Add at least one image.");
      return;
    }

    const fd = new FormData(form);
    fd.set("images", JSON.stringify(images));
    if (active) fd.set("active", "on");
    else fd.delete("active");

    startSaving(async () => {
      const res = await saveProjectAction(project?.slug ?? null, fd);
      if (!res.ok) {
        setError(res.error);
        toast(res.error, "error");
        return;
      }
      setError(null);
      setDirty(false);
      if (isNew) {
        router.push(`/admin/projects/${res.slug}/edit?created=1`);
        return;
      }
      setItems((prev) => prev.map((i) => ({ ...i, isNew: false })));
      setJustSaved(true);
      toast("Saved", "success");
    });
  }

  function remove() {
    if (!project) return;
    if (!confirm(`Delete “${project.title}” and all of its images? This can't be undone.`)) return;
    startDeleting(async () => {
      const res = await deleteProjectAction(project.slug);
      if (!res.ok) {
        toast(res.error, "error");
        return;
      }
      setDirty(false);
      toast(`Deleted “${project.title}”`, "success");
      router.push("/admin");
    });
  }

  useSaveShortcut(save);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onChange={markDirty}
      noValidate={false}
    >
      {/* Heading */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 font-archivo text-[13px] text-ink/55 hover:text-ink"
        >
          <span aria-hidden>←</span> Projects
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-caslon text-[26px] font-bold leading-tight sm:text-[32px]">
            {isNew ? "New project" : title || "Untitled"}
          </h1>
          {!isNew && (
            <div className="mt-1.5 flex items-center gap-2">
              <StatusPill active={project.active} />
              <span className="font-archivo text-[12px] text-ink/45">/projects/{project.slug}</span>
            </div>
          )}
        </div>
        {!isNew && project.active && (
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noopener"
            className={buttonClass("secondary")}
          >
            View on site ↗
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        {/* Images */}
        <Section
          title="Images"
          description="The cover is shown in the grid and at the top of the project page; the rest follow in this order."
        >
          <ImageManager items={items} setItems={setItems} storageMode={storageMode} onChange={markDirty} />
        </Section>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <Section title="Details">
            <div className="flex flex-col gap-4">
              <Field label="Title">
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Riverside Clearing"
                  className={inputClass}
                />
              </Field>

              {isNew && (
                <Field
                  label="URL"
                  hint={
                    <>
                      /projects/<strong className="font-medium text-ink/70">{slugPreview(slugInput || title)}</strong>
                      {" "}— leave blank to use the title
                    </>
                  }
                >
                  <input
                    name="slug"
                    value={slugInput}
                    onChange={(e) => setSlugInput(e.target.value)}
                    placeholder="optional"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={inputClass}
                  />
                </Field>
              )}

              <fieldset>
                <legend className="mb-1.5 font-archivo text-[13px] font-medium text-ink/70">Tags</legend>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map((t) => (
                    <label key={t.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="tags"
                        value={t.id}
                        defaultChecked={project?.tags.includes(t.id)}
                        className="peer sr-only"
                      />
                      <span
                        style={{ "--tag": tagColor(t.id) } as React.CSSProperties}
                        className={cx(
                          "inline-flex min-h-[34px] items-center rounded-full border border-[var(--tag)] px-3 font-archivo text-[13px] font-medium text-[var(--tag)] transition-colors",
                          "peer-checked:bg-[var(--tag)] peer-checked:text-white",
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg"
                        )}
                      >
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Year">
                  <input name="date" defaultValue={project?.date} placeholder="2025" className={inputClass} />
                </Field>
                <Field label="Time spent">
                  <input name="time" defaultValue={project?.time} placeholder="6 hours" className={inputClass} />
                </Field>
                <Field label="Tools" className="col-span-2">
                  <input
                    name="tool"
                    defaultValue={project?.tool}
                    placeholder="Clip Studio Paint"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={project?.description}
                  className={cx(inputClass, "min-h-[120px] resize-y leading-relaxed")}
                />
              </Field>

              <div className="flex items-center justify-between gap-3 rounded-[8px] bg-ink/[0.04] px-3 py-2.5">
                <div>
                  <p className="font-archivo text-[14px] font-medium">Visible on the site</p>
                  <p className="font-archivo text-[12px] text-ink/50">
                    {active ? "Anyone can see this project." : "Only visible here in the admin."}
                  </p>
                </div>
                <Switch
                  checked={active}
                  onChange={(v) => {
                    setActive(v);
                    markDirty();
                  }}
                  label="Visible on the site"
                />
              </div>
            </div>
          </Section>

          {!isNew && (
            <DangerZone onDelete={remove} deleting={deleting} />
          )}
        </div>

      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-[8px] bg-tag-comission/10 px-4 py-3 font-archivo text-[14px] text-tag-comission">
          {error}
        </p>
      )}

      <SaveBar
        status={status}
        onSave={save}
        label={isNew ? "Create project" : "Save"}
        extra={
          isNew ? (
            <Link href="/admin" className={buttonClass("ghost", "hidden sm:inline-flex")}>
              Cancel
            </Link>
          ) : null
        }
      />
    </form>
  );
}

function DangerZone({ onDelete, deleting }: { onDelete: () => void; deleting: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-tag-comission/25 px-4 py-3">
      <div>
        <p className="font-archivo text-[14px] font-medium">Delete project</p>
        <p className="font-archivo text-[12px] text-ink/50">Removes it and all its images for good.</p>
      </div>
      <button type="button" onClick={onDelete} disabled={deleting} className={buttonClass("danger")}>
        {deleting && <Spinner />} Delete
      </button>
    </div>
  );
}
