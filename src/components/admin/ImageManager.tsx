"use client";

import Image from "next/image";
import { deleteProjectImageAction, moveProjectImageAction } from "@/app/admin/actions";
import { MAX_IMAGES_PER_PROJECT, type ProjectImage } from "@/lib/data";

export default function ImageManager({
  slug,
  images,
  addAction,
}: {
  slug: string;
  images: ProjectImage[];
  addAction: (formData: FormData) => void | Promise<void>;
}) {
  const boundDelete = deleteProjectImageAction.bind(null, slug);
  const boundMove = moveProjectImageAction.bind(null, slug);
  const roomLeft = MAX_IMAGES_PER_PROJECT - images.length;

  return (
    <div className="mt-4">
      <p className="mb-3 font-archivo text-[13px] text-gray">
        The first image is docked at the top of the project page; the rest are stacked below it,
        in this order.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.src} className="overflow-hidden rounded-[7px] border border-gray">
            <div className="relative aspect-square bg-black/5">
              <Image src={img.src} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 font-archivo text-[10px] text-bg">
                  main
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 p-2 font-archivo text-[12px]">
              <form action={boundMove.bind(null, i, -1)}>
                <button type="submit" disabled={i === 0} className="disabled:opacity-30" aria-label="Move up">
                  ↑
                </button>
              </form>
              <form action={boundMove.bind(null, i, 1)}>
                <button
                  type="submit"
                  disabled={i === images.length - 1}
                  className="disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </form>
              <form
                action={boundDelete.bind(null, i)}
                onSubmit={(e) => {
                  if (images.length <= 1 || !confirm("Remove this image?")) {
                    e.preventDefault();
                  }
                }}
              >
                <button
                  type="submit"
                  disabled={images.length <= 1}
                  className="text-tag-comission disabled:opacity-30"
                >
                  remove
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {roomLeft > 0 ? (
        <form action={addAction} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" name="images" accept="image/*" multiple />
          <button
            type="submit"
            className="rounded-[6px] bg-ink px-4 py-2 font-archivo text-[13px] font-medium text-bg"
          >
            add images ({roomLeft} left)
          </button>
        </form>
      ) : (
        <p className="mt-4 font-archivo text-[13px] text-gray">Maximum of {MAX_IMAGES_PER_PROJECT} images reached.</p>
      )}
    </div>
  );
}
