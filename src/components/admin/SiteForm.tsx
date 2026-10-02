"use client";

import { useRef, useState, useTransition } from "react";
import type { Site } from "@/lib/data";
import { discardUploadsAction, updateSiteAction } from "@/app/admin/actions";
import { CV_PATHNAME, errorMessage, uploadFile, type StorageMode } from "@/lib/upload-client";
import {
  Field,
  SaveBar,
  Section,
  Spinner,
  buttonClass,
  cx,
  inputClass,
  toast,
  useSaveShortcut,
  useUnsavedChangesWarning,
  type SaveStatus,
} from "@/components/admin/ui";

export default function SiteForm({ site, storageMode }: { site: Site; storageMode: StorageMode }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [cvUrl, setCvUrl] = useState(site.contact.cvUrl);
  const [cvUpload, setCvUpload] = useState<{ name: string; progress: number } | null>(null);
  const [newCv, setNewCv] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, startSaving] = useTransition();

  useUnsavedChangesWarning(dirty);

  const markDirty = () => {
    setDirty(true);
    setJustSaved(false);
  };

  const status: SaveStatus = saving
    ? "saving"
    : cvUpload
      ? "uploading"
      : dirty
        ? "dirty"
        : justSaved
          ? "saved"
          : "clean";

  async function pickCv(file: File) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast("The CV must be a PDF file.", "error");
      return;
    }
    setCvUpload({ name: file.name, progress: 0 });
    try {
      const url = await uploadFile(file, CV_PATHNAME, {
        mode: storageMode,
        contentType: "application/pdf",
        onProgress: (p) => setCvUpload({ name: file.name, progress: p }),
      });
      // A CV uploaded earlier in this session but not saved can go.
      if (newCv) void discardUploadsAction([newCv]);
      setNewCv(url);
      setCvUrl(url);
      markDirty();
    } catch (err) {
      toast(`CV upload failed: ${errorMessage(err)}`, "error");
    } finally {
      setCvUpload(null);
    }
  }

  function save() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fd = new FormData(form);
    fd.set("cvUrl", cvUrl);
    startSaving(async () => {
      const res = await updateSiteAction(fd);
      if (!res.ok) {
        toast(res.error, "error");
        return;
      }
      setDirty(false);
      setNewCv(null);
      setJustSaved(true);
      toast("Saved", "success");
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
    >
      <h1 className="font-caslon text-[28px] font-bold leading-none sm:text-[32px]">Site texts</h1>
      <p className="mt-1.5 font-archivo text-[13px] text-ink/55">
        Everything on the home page outside the project grid.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5">
          <Section title="Intro">
            <div className="flex flex-col gap-4">
              <Field label="Name">
                <input name="name" defaultValue={site.name} className={inputClass} />
              </Field>
              <Field label="Main text" hint="The large text at the top of the home page.">
                <textarea
                  name="heroLead"
                  rows={4}
                  defaultValue={site.heroLead}
                  className={cx(inputClass, "resize-y leading-relaxed")}
                />
              </Field>
              <Field label="Secondary text">
                <textarea
                  name="heroSecondary"
                  rows={3}
                  defaultValue={site.heroSecondary}
                  className={cx(inputClass, "resize-y leading-relaxed")}
                />
              </Field>
            </div>
          </Section>

          <Section title="About me" description="Start a new line for each paragraph.">
            <textarea
              name="about"
              rows={9}
              defaultValue={site.about.join("\n\n")}
              aria-label="About me"
              className={cx(inputClass, "resize-y leading-relaxed")}
            />
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  defaultValue={site.contact.email}
                  autoCapitalize="none"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone">
                <input type="tel" name="tel" defaultValue={site.contact.tel} className={inputClass} />
              </Field>
              <Field label="Instagram URL" className="sm:col-span-2">
                <input
                  type="text" inputMode="url" autoCapitalize="none"
                  name="instagram"
                  defaultValue={site.contact.instagram}
                  placeholder="https://instagram.com/…"
                  className={inputClass}
                />
              </Field>
              <Field label="Behance URL" className="sm:col-span-2">
                <input
                  type="text" inputMode="url" autoCapitalize="none"
                  name="behance"
                  defaultValue={site.contact.behance}
                  placeholder="https://behance.net/…"
                  className={inputClass}
                />
              </Field>
              <Field label="LinkedIn URL" className="sm:col-span-2">
                <input
                  type="text" inputMode="url" autoCapitalize="none"
                  name="linkedin"
                  defaultValue={site.contact.linkedin}
                  placeholder="https://linkedin.com/in/…"
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section title="CV" description="A PDF linked from the contact section.">
            <div className="flex flex-wrap items-center gap-3">
              {cvUpload ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Spinner />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-archivo text-[13px]">{cvUpload.name}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full bg-ink transition-[width]"
                        style={{ width: `${Math.round(cvUpload.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-w-0 flex-1 items-center gap-2 font-archivo text-[14px] underline underline-offset-2"
                >
                  <PdfIcon />
                  <span className="truncate">{newCv ? "New CV (unsaved)" : "Current CV"}</span>
                </a>
              ) : (
                <p className="flex-1 font-archivo text-[14px] text-ink/50">No CV uploaded.</p>
              )}

              <label className={buttonClass("secondary", "cursor-pointer")}>
                {cvUrl ? "Replace" : "Upload PDF"}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  disabled={!!cvUpload}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void pickCv(f);
                  }}
                />
              </label>
              {cvUrl && !cvUpload && (
                <button
                  type="button"
                  onClick={() => {
                    setCvUrl("");
                    markDirty();
                  }}
                  className={buttonClass("ghost")}
                >
                  Remove
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>

      <SaveBar status={status} onSave={save} />
    </form>
  );
}

function PdfIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-tag-comission" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 2.5h6.5L15.5 6.5V17a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M11.5 2.5v4h4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
