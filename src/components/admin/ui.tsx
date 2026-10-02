"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

// ---- Class helpers -------------------------------------------------------------

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export const inputClass =
  "w-full rounded-[6px] border border-ink/15 bg-white/70 px-3 py-2.5 font-archivo text-[15px] text-ink " +
  "placeholder:text-ink/35 transition-colors focus:border-ink/50 focus:bg-white focus:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ink/10";

export const cardClass = "rounded-[10px] border border-ink/10 bg-white/55";

const buttonBase =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[6px] px-4 font-archivo text-[14px] font-medium " +
  "transition-[background-color,color,opacity,box-shadow] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-45 select-none";

const buttonVariants = {
  primary: "bg-ink text-bg hover:bg-ink/85",
  secondary: "border border-ink/15 bg-white/70 text-ink hover:border-ink/35 hover:bg-white",
  ghost: "text-ink/75 hover:bg-ink/5 hover:text-ink",
  danger: "border border-tag-comission/40 text-tag-comission hover:bg-tag-comission hover:text-white",
} as const;

export function buttonClass(variant: keyof typeof buttonVariants = "primary", extra?: string) {
  return cx(buttonBase, buttonVariants[variant], extra);
}

// ---- Small components -------------------------------------------------------------

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("flex flex-col gap-1.5", className)}>
      <span className="font-archivo text-[13px] font-medium text-ink/70">{label}</span>
      {children}
      {hint && <span className="font-archivo text-[12px] leading-snug text-ink/50">{hint}</span>}
    </label>
  );
}

export function Section({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(cardClass, "p-4 sm:p-5", className)}>
      <h2 className="font-caslon text-[19px] font-bold leading-tight">{title}</h2>
      {description && (
        <p className="mt-1 font-archivo text-[13px] leading-snug text-ink/55">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Accessible on/off switch. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const track = size === "sm" ? "h-[22px] w-[38px]" : "h-[26px] w-[46px]";
  const knob = size === "sm" ? "h-[16px] w-[16px]" : "h-[20px] w-[20px]";
  const shift = size === "sm" ? "translate-x-[16px]" : "translate-x-[20px]";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex shrink-0 items-center rounded-full p-[3px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        track,
        checked ? "bg-[#3d9a5b]" : "bg-ink/20"
      )}
    >
      <span
        className={cx(
          "rounded-full bg-white shadow-sm transition-transform",
          knob,
          checked ? shift : "translate-x-0"
        )}
      />
    </button>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-archivo text-[11px] font-medium",
        active ? "bg-[#3d9a5b]/12 text-[#2f7a47]" : "bg-ink/8 text-ink/60"
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", active ? "bg-[#3d9a5b]" : "bg-ink/40")} />
      {active ? "live" : "hidden"}
    </span>
  );
}

// ---- Toasts -------------------------------------------------------------------------

type Toast = { id: number; message: string; tone: "info" | "error" | "success" };
let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(message: string, tone: Toast["tone"] = "info") {
  const id = nextId++;
  toasts = [...toasts, { id, message, tone }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, tone === "error" ? 6000 : 3000);
}

const EMPTY: Toast[] = [];

export function Toaster() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => EMPTY
  );
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-[60] flex flex-col items-center gap-2 px-4"
    >
      {list.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className={cx(
            "pointer-events-auto max-w-md rounded-[8px] px-4 py-2.5 font-archivo text-[14px] shadow-lg",
            t.tone === "error" ? "bg-tag-comission text-white" : "bg-ink text-bg"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---- Sticky save bar --------------------------------------------------------------

export type SaveStatus = "clean" | "dirty" | "saving" | "saved" | "uploading";

/**
 * Bottom-docked bar with the primary save button, so it's always reachable on
 * phones without scrolling to the end of a long form.
 */
export function SaveBar({
  status,
  onSave,
  label = "Save",
  extra,
  disabled,
}: {
  status: SaveStatus;
  onSave?: () => void;
  label?: string;
  extra?: ReactNode;
  disabled?: boolean;
}) {
  const text: Record<SaveStatus, string> = {
    clean: "All changes saved",
    dirty: "Unsaved changes",
    saving: "Saving…",
    saved: "Saved",
    uploading: "Uploading images…",
  };
  return (
    <div className="sticky bottom-0 z-40 -mx-4 mt-8 border-t border-ink/10 bg-bg/90 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p
          className={cx(
            "flex min-w-0 items-center gap-2 truncate font-archivo text-[13px]",
            status === "dirty" ? "text-ink" : "text-ink/55"
          )}
        >
          {(status === "saving" || status === "uploading") && <Spinner />}
          {status === "dirty" && <span className="h-2 w-2 shrink-0 rounded-full bg-tag-concept" />}
          {status === "saved" && <span aria-hidden>✓</span>}
          <span className="truncate">{text[status]}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {extra}
          <button
            type={onSave ? "button" : "submit"}
            onClick={onSave}
            disabled={disabled || status === "saving" || status === "uploading"}
            className={buttonClass("primary", "min-w-[96px]")}
          >
            {status === "saving" ? <Spinner /> : null}
            {label}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Warns before closing/reloading the tab while there are unsaved changes. */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/** Cmd/Ctrl+S triggers `save` instead of the browser's "save page". */
export function useSaveShortcut(save: () => void) {
  const ref = useRef(save);
  useEffect(() => {
    ref.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
