"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { MAX_IMAGES_PER_PROJECT, type ProjectImage } from "@/lib/data";
import {
  errorMessage,
  imagePathname,
  prepareImage,
  runWithConcurrency,
  uploadFile,
  type StorageMode,
} from "@/lib/upload-client";
import { discardUploadsAction } from "@/app/admin/actions";
import SortableGrid from "@/components/admin/SortableGrid";
import { Spinner, cx, toast } from "@/components/admin/ui";

export type ImageItem = {
  id: string;
  src?: string;
  width: number;
  height: number;
  /** Local object URL for files picked in this session (instant preview). */
  previewUrl?: string;
  status: "ready" | "uploading" | "error";
  progress: number;
  error?: string;
  file?: File;
  /** Uploaded in this session and not saved into the project yet. */
  isNew?: boolean;
};

export function toImageItems(images: ProjectImage[]): ImageItem[] {
  return images.map((img) => ({ id: img.src, ...img, status: "ready", progress: 1 }));
}

export function toProjectImages(items: ImageItem[]): ProjectImage[] {
  return items
    .filter((i) => i.status === "ready" && i.src)
    .map((i) => ({ src: i.src!, width: i.width, height: i.height }));
}

const TILE_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px";

export default function ImageManager({
  items,
  setItems,
  storageMode,
  onChange,
}: {
  items: ImageItem[];
  setItems: Dispatch<SetStateAction<ImageItem[]>>;
  storageMode: StorageMode;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const aborts = useRef(new Map<string, AbortController>());
  const [dragOver, setDragOver] = useState(false);
  const roomLeft = MAX_IMAGES_PER_PROJECT - items.length;

  function patch(id: string, update: Partial<ImageItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...update } : it)));
  }

  async function uploadOne(id: string, file: File) {
    const ctrl = new AbortController();
    aborts.current.set(id, ctrl);
    patch(id, { status: "uploading", progress: 0, error: undefined });
    try {
      const prepared = await prepareImage(file);
      patch(id, { width: prepared.width, height: prepared.height, progress: 0.02 });
      const url = await uploadFile(prepared.body, imagePathname(file.name, prepared.type), {
        mode: storageMode,
        contentType: prepared.type,
        signal: ctrl.signal,
        onProgress: (f) => patch(id, { progress: Math.max(0.02, f) }),
      });
      if (ctrl.signal.aborted) return;
      patch(id, { src: url, status: "ready", progress: 1, isNew: true });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      patch(id, { status: "error", error: errorMessage(err) });
    } finally {
      aborts.current.delete(id);
    }
  }

  function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!files.length) return;
    if (roomLeft <= 0) {
      toast(`This project already has the maximum of ${MAX_IMAGES_PER_PROJECT} images.`, "error");
      return;
    }
    const accepted = files.slice(0, roomLeft);
    if (accepted.length < files.length) {
      toast(`Only ${roomLeft} more image${roomLeft === 1 ? "" : "s"} fit — the rest were skipped.`, "error");
    }
    const newItems: ImageItem[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      width: 0,
      height: 0,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
      progress: 0,
      file,
    }));
    setItems((prev) => [...prev, ...newItems]);
    onChange();
    void runWithConcurrency(
      newItems.map((it) => () => uploadOne(it.id, it.file!)),
      3
    );
  }

  function remove(item: ImageItem) {
    aborts.current.get(item.id)?.abort();
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    onChange();
    // Uploaded but never saved: nothing references it, so delete it now
    // instead of leaving an orphaned file in storage.
    if (item.isNew && item.src) void discardUploadsAction([item.src]);
  }

  function makeCover(item: ImageItem) {
    setItems((prev) => [item, ...prev.filter((it) => it.id !== item.id)]);
    onChange();
  }

  function move(item: ImageItem, dir: -1 | 1) {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === item.id);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    onChange();
  }

  const uploading = items.filter((i) => i.status === "uploading").length;

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
      }}
      className={cx("rounded-[10px] transition-shadow", dragOver && "ring-2 ring-ink/40 ring-offset-4 ring-offset-bg")}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-archivo text-[13px] text-ink/55">
          {items.length}/{MAX_IMAGES_PER_PROJECT} · first image is the cover
          {uploading > 0 && ` · uploading ${uploading}…`}
        </p>
        {items.length > 1 && (
          <p className="hidden font-archivo text-[12px] text-ink/45 sm:block">Drag to reorder</p>
        )}
      </div>

      {items.length > 0 && (
        <SortableGrid
          items={items}
          getId={(it) => it.id}
          onReorder={(next) => {
            setItems(next);
            onChange();
          }}
          className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
          renderItem={(item, index, { isDragging }) => (
            <ImageTile
              item={item}
              index={index}
              total={items.length}
              isDragging={isDragging}
              onRemove={() => remove(item)}
              onCover={() => makeCover(item)}
              onMove={(d) => move(item, d)}
              onRetry={() => item.file && uploadOne(item.id, item.file)}
            />
          )}
        />
      )}

      {roomLeft > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cx(
            "mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-[10px] border-2 border-dashed px-4 text-center transition-colors",
            items.length === 0 ? "py-14" : "py-6",
            dragOver ? "border-ink/50 bg-white" : "border-ink/15 bg-white/40 hover:border-ink/35 hover:bg-white/70"
          )}
        >
          <UploadIcon />
          <span className="font-archivo text-[14px] font-medium">
            {items.length === 0 ? "Add images" : "Add more images"}
          </span>
          <span className="font-archivo text-[12px] text-ink/50">
            <span className="hidden sm:inline">Drop files here or click to browse · </span>
            JPG, PNG, WebP · large photos are resized automatically
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ImageTile({
  item,
  index,
  total,
  isDragging,
  onRemove,
  onCover,
  onMove,
  onRetry,
}: {
  item: ImageItem;
  index: number;
  total: number;
  isDragging: boolean;
  onRemove: () => void;
  onCover: () => void;
  onMove: (dir: -1 | 1) => void;
  onRetry: () => void;
}) {
  const isCover = index === 0;
  const src = item.previewUrl ?? item.src;

  return (
    <div
      className={cx(
        "overflow-hidden rounded-[10px] border bg-white/80 transition-shadow",
        isDragging ? "border-ink/40 shadow-xl" : isCover ? "border-ink/45" : "border-ink/10"
      )}
    >
      <div className="relative aspect-square bg-ink/5">
        {src &&
          (item.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob: preview
            <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
          ) : (
            <Image src={src} alt="" fill sizes={TILE_SIZES} draggable={false} className="object-cover" />
          ))}

        {isCover && (
          <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 font-archivo text-[11px] font-medium text-bg">
            cover
          </span>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-bg backdrop-blur transition-colors hover:bg-tag-comission"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {item.status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-[1px]">
            <Spinner className="text-ink/70" />
            <span className="font-archivo text-[12px] font-medium text-ink/75">
              {item.progress > 0.02 ? `${Math.round(item.progress * 100)}%` : "Preparing…"}
            </span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-ink/10">
              <div
                className="h-full bg-ink transition-[width] duration-200"
                style={{ width: `${Math.round(item.progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {item.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-tag-comission/85 p-3 text-center text-white">
            <span className="line-clamp-3 font-archivo text-[12px] leading-snug">{item.error}</span>
            {item.file && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-white px-3 py-1 font-archivo text-[12px] font-medium text-tag-comission"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 px-1.5 py-1.5">
        <div className="flex">
          <IconButton label="Move earlier" disabled={index === 0} onClick={() => onMove(-1)}>
            <path d="M12 5 7 10l5 5" />
          </IconButton>
          <IconButton label="Move later" disabled={index === total - 1} onClick={() => onMove(1)}>
            <path d="m8 5 5 5-5 5" />
          </IconButton>
        </div>
        {!isCover && item.status === "ready" && (
          <button
            type="button"
            onClick={onCover}
            className="whitespace-nowrap rounded-[6px] px-1.5 py-1.5 font-archivo text-[12px] text-ink/65 hover:bg-ink/5 hover:text-ink"
          >
            Set cover
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-ink/60 hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-25"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

function UploadIcon() {
  return (
    <svg className="mb-1 h-6 w-6 text-ink/45" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
