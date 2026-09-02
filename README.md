# Júlia Ferreira — Portfolio

A pixel-fidelity implementation of the Figma design for Júlia Ferreira's illustration
portfolio, built with Next.js (App Router), TypeScript, and Tailwind CSS v4.

This first deliverable is the **public-facing site only** — pixel-matched to Figma on
both desktop and mobile. The admin login and content-editing backend is a separate,
follow-up phase (see "Next phase" below).

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
- `src/lib/data.ts` — every project's title/tags/date/time/tool/description/images in
  one typed array, plus the hero/about/contact copy. This is the file to hand to a
  future CMS/admin — it's already shaped as the data layer.
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
- **Contact details** (phone / email / Instagram / LinkedIn / CV link) are still
  empty placeholders in `src/lib/data.ts` (`SITE.contact`) — fill those in whenever
  you have them.
- **About-me paragraphs**: currently the same repeated placeholder copy shown in the
  Figma mockup. Swap in Júlia's real bio in `SITE.about` (`src/lib/data.ts`) whenever
  it's ready.

## Interactions implemented

- Tag filter (multi-select) over the masonry project grid.
- Project detail "popup": 2/3 image + 1/3 sticky info panel on desktop; centered
  image + info below on mobile.
- Multi-image projects scroll vertically inside the image column with the next image
  already peeking into view (component supports this today — none of the current 29
  pieces use more than one image yet, but adding a second `images` entry to any
  project in `src/lib/data.ts` turns it on).
- Desktop: left/right halves of the image act as invisible prev/next click zones,
  with `w-resize` / `e-resize` cursors.
- Mobile: swipe left/right to move between projects, plus a brief left/right arrow
  hint that fades in and out on first view of a project.

## Next phase (not built yet)

Admin login + editable text/images. Recommended approach when you're ready:

1. A database (Postgres via Vercel Postgres, Supabase, or Neon all work well with
   Next.js) to hold what's currently the static array in `src/lib/data.ts`.
2. Object storage for uploaded images (Vercel Blob, S3, or Cloudinary) — a plain
   `public/` folder doesn't survive re-deploys/serverless the way it does here in
   development.
3. Simple credential-based auth (NextAuth.js Credentials provider, or Vercel/Clerk
   auth) gating a `/admin` route with forms that write to that database.

Happy to build that next whenever you're ready — just say the word.
