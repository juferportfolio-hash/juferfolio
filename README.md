# Júlia Ferreira — Portfolio

A pixel-fidelity implementation of the Figma design for Júlia Ferreira's illustration
portfolio, built with Next.js (App Router), TypeScript, and Tailwind CSS v4.

Pixel-matched to Figma on both desktop and mobile, plus a password-protected
`/admin` section (see "Admin section" below) so the site owner can add/edit/remove
projects and site copy without touching code.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## Fonts

- **Adobe Caslon Pro** (headline / nav / hero-illustration caption font) is loaded from
  your Adobe Fonts (Typekit) kit, linked in `src/app/layout.tsx`:
  `https://use.typekit.net/pok1buc.css`. This requires a live network connection to
  `use.typekit.net` at runtime (normal in any real browser/deployment) — it is **not**
  bundled at build time, so it never blocks `next build`.
  - The CSS variable `--font-caslon` (in `src/app/globals.css`) lists
    `"adobe-caslon-pro"` as the primary family name — this is Adobe's standard Typekit
    slug for this font. If your kit publishes it under a different CSS name, open your
    Typekit kit's editor and update that one line.
  - Fallback stack: `"Libre Caslon Text", Georgia, "Times New Roman", serif` — a free,
    visually close alternative, so the layout still looks reasonable before the kit
    loads or if Typekit is ever unreachable.
- **Archivo** (body/paragraph font) is self-hosted via the `@fontsource/archivo`
  package (weights 300/400/500/600/700), so there's no external network call and no
  Google Fonts build-time dependency at all.

### The italic → roman hover effect

Every headline/nav element styled in Adobe Caslon Pro Bold Italic uses the
`.hover-roman` utility class (`src/app/globals.css`): `font-style: italic` by default,
`font-style: normal` on `:hover`. As long as your Typekit kit includes both the italic
and the roman (upright) cut of the bold weight, the browser will swap to the actual
roman glyphs on hover — not a faux-italic skew.

## Design tokens

All spec values from the design brief live as named tokens/constants rather than
scattered magic numbers:

- Colors — `src/app/globals.css` (`--color-bg`, `--color-ink`, `--color-gray`, and the
  six `--color-tag-*` values).
- Shared spacing (30px desktop / content gutters on mobile) — `src/lib/ui.ts`.
- Type sizes are applied directly with Tailwind arbitrary values (`text-[40px]
  md:text-[20px]` etc.) next to each element, matching the desktop/mobile spec table
  1:1 — search a component for the value you want to tweak.

## Layout structure

- `src/components/Frame.tsx` — the always-visible 1px outer frame. It's `position:
  fixed`, fills the viewport, and contains the one scrollable region
  (`#frame-scroll`); the header lives inside that scroller with `position: sticky` so
  frame + header both stay put while everything else scrolls underneath them, per the
  "window you look through" spec.
- `src/components/Header.tsx` — logo + nav (desktop) / hamburger (mobile). Shows the
  "• projects •" bullet treatment when a project detail route is active.
- `src/app/page.tsx` — homepage: `Hero`, `ProjectsSection` (tag filter + masonry),
  `AboutMe`, `Contact`.
- `src/app/projects/[slug]/page.tsx` + `src/components/ProjectDetail.tsx` — the project
  "popup" view. Because it's just a normal nested route rendered inside the same
  persistent Frame/Header layout, opening a project never re-mounts the frame — it
  only swaps the content beneath it, which is what gives the sticky-window feel
  without any actual modal/overlay machinery.
- `src/lib/data.ts` — shared types only (`Project`, `Site`, `TAGS`, ...). No content
  lives here anymore.
- `data/projects.json` / `data/site.json` — the actual project list and site copy,
  read/written by `src/lib/store.ts` (server-only). This is what `/admin` edits.
- `src/app/admin/` + `src/components/admin/` — the admin section: login, dashboard,
  project create/edit forms, image manager, site-text editor. See "Admin section"
  below.
- `src/lib/masonry.ts` — a small greedy "shortest column next" placement function.
  Plain CSS `columns` fills one column completely before starting the next (so the
  grid doesn't read left-to-right); this keeps the reading order sane the way the
  Figma grid does, and is computed separately for the 2-column mobile and 3-column
  desktop layouts (both render in the DOM; CSS `hidden md:flex` picks the right one —
  no client-side breakpoint detection, no hydration flash).

## Content

- **Projects**: the 29 real pieces you supplied (the "concept" and "commission" Google
  Drive folders) are wired in as the live project grid — tagged, dated, and
  captioned in `src/lib/data.ts`. Swap/add real titles, dates, tools, and
  descriptions there whenever you want; everything else (masonry placement, detail
  page, tag filtering) picks it up automatically.
- **Hero sketch, "PORTFOLIO" paper, and the waving-hand illustration**: extracted
  directly from your Figma file at high resolution
  (`public/images/illustrations/`).
- **About-me photo**: also pulled from the Figma file.
- **Contact details** (phone / email / Instagram / LinkedIn / CV link) and the
  **about-me paragraphs** now live in `data/site.json` and are editable from
  `/admin/site` — no code changes needed.

## Interactions implemented

- Tag filter (multi-select) over the masonry project grid.
- Project detail "popup": 2/3 image + 1/3 sticky info panel on desktop; centered
  image + info below on mobile.
- Multi-image projects scroll vertically inside the image column with the next image
  already peeking into view. Add more entries to a project's `images` array (from
  `/admin`, no code needed) to turn this on for any project.
- Desktop: left/right halves of the image act as invisible prev/next click zones, with
  an explicit left/right arrow cursor (not the ambiguous `w-resize`/`e-resize`) so the
  direction always matches which half of the frame you're over.
- Mobile: `src/components/ProjectImageSwiper.tsx` drives the image frame — dragging
  follows your finger 1:1 (with the previous/next project's cover peeking in from the
  side you're dragging toward), releasing past ~22% of the frame's width commits to
  that neighbor and snaps the rest of the way before navigating, otherwise it springs
  back. On open it also runs a brief automatic nudge toward whichever neighbors exist,
  as a one-time hint. The description panel underneath is untouched by any of this —
  it still just swaps instantly on navigation.
- The close ("×") button lives in the image frame's top-right corner (not the
  description panel) on both breakpoints.

## Admin section

Visit `/admin` and sign in with the password in `.env.local` (`ADMIN_PASSWORD` — an
initial one was generated for you; change it any time, it's just a plain env var).

From there you can (works on phones too):

- **Projects dashboard** (`/admin`) — search, filter by live/hidden and by tag, flip a
  project live/hidden with its switch (instant), delete it, or hit **Reorder** and drag
  projects into the order they appear on the site (press-and-hold to drag on touch).
  New projects are added at the top.
- **Add / edit a project** (`/admin/projects/new`, `/admin/projects/[slug]/edit`) —
  text fields, tags, visibility, and up to 60 images. Images upload as soon as you
  pick or drop them (with progress), large photos are downscaled in the browser to
  3200px first, and you can drag to reorder, "Set cover", or remove. The first image
  is the cover. Nothing changes on the site until you press **Save** (or Ctrl/Cmd+S);
  images you removed are deleted from storage after the save.
- **Edit site texts** (`/admin/site`) — hero text, about-me paragraphs, contact links
  and the CV PDF.

Auth is a signed, httpOnly session cookie (`src/lib/auth.ts`) — no third-party auth
dependency. Every mutation goes through a Next.js Server Action in
`src/app/admin/actions.ts`, each of which re-checks the session server-side, so the
data can't be edited by POSTing to an action without a valid cookie even if someone
finds the URL.

### How content is stored

`src/lib/store.ts` picks one of two backends:

- **Vercel Blob** — whenever `BLOB_READ_WRITE_TOKEN` is set (automatic once a Blob
  store is connected to the Vercel project). This is the production setup.
- **Local files** — otherwise: `data/*.json` plus uploads under `public/`. Handy for
  `npm run dev` without touching production data.

Details that matter on Vercel:

- **Uploads never pass through a function.** Vercel rejects function request bodies over
  ~4.5 MB, so the browser asks `/api/admin/upload` for a short-lived upload token and
  then sends the file straight to Blob. Server Actions only ever receive URLs and sizes.
- **Content is versioned, not overwritten.** Every save writes a new immutable
  `content/projects/<timestamp>-….json` (or `content/site/…`) and reads take the newest
  one. Overwriting one file doesn't work on a public Blob store: its CDN caches each URL
  for at least 60 s, so edits showed up late and a quick second edit could undo the
  first. The last ~20 versions are kept as an undo history (restore one by copying it
  in the Blob dashboard); older ones are pruned automatically. If no versions exist yet,
  the old `data/projects.json` blob, and then the bundled `data/*.json`, are used as
  the starting point.
- **Reads are cached.** Pages read content through Next's data cache (tag `content`), and
  every admin save expires it, so edits are live immediately while normal visits don't
  hit Blob. As a safety net the cache also refreshes hourly, which also picks up edits
  made from a local dev server pointed at the same Blob store.
