# Horizon Caption Studio

Image annotation studio for satellite imagery, powered by Skytek. Five pages (sign-in, dashboard, project, editor, settings) built into one self-contained HTML file and hosted as a Claude artifact.

## Layout

- `src/` — page markup (`*.html`), page scripts and shared UI (`assets/js/`), styles (`assets/css/`).
- `build/store.js` — data layer. Projects, images and brand assets live in the artifact's shared database; image files in artifact asset storage. Same `Store` API the pages call.
- `build/shell.js` — single-page router, page lifecycle cleanup, downloads and AI hookups.
- `build/build.py` — assembles everything into `index.html`.
- `index.html` — the built app at the repository root, identical to the published artifact. GitHub Pages serves this file.

## Brand

The logo device lives in `src/assets/img/logo-device.svg`. It is inlined in `src/assets/js/ui.js` (`UI.logoSVG()`) for the sidebar, sign-in page and editor, and used as the page icon by the build.

The sign-in background photo is `src/assets/img/login-earth.webp` (embedded by the build).

## Build

```
python3 build/build.py
```

Requires Python 3 only. The output loads Lucide and JSZip from public CDNs and fonts from Google Fonts.

## Where data is stored

- **On claude.ai** (the published artifact): projects and images live in the artifact’s shared storage.
- **Anywhere else** (GitHub Pages): the app starts at the sign-in screen and uses the shared **Supabase** project — tables `projects`, `images`, `brand_assets` and the private `caption-images` bucket (see `SUPABASE_SETUP.sql`). Everyone using the GitHub Pages site shares the same projects. Connection settings are the `SUPABASE` block in `build/store.js`; the key there is Supabase’s publishable browser key, and access is governed by the Row-Level Security policies in the SQL file.
- Each image can have its own canvas (size, image position, background). On Supabase it is stored inside the `objects` column as an entry of type `__canvas`, so no schema change is needed.
- The two locations hold separate data: projects made on claude.ai don’t appear on GitHub Pages and vice versa.
- The sign-in screen is a simple shared gate (`skytek` / `skytek`).
- The editor’s **Map** tab (callouts, rings, scale bar, track, labels, legend, footer) lives in `src/assets/js/editor.js` as the `Kit` module.

## GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`.
- The editor’s **Map** tab (callouts, rings, scale bar, track) lives in `src/assets/js/editor.js` as the `Kit` module.
- The sign-in screen is a simple shared gate (`skytek` / `skytek`); real access control is the artifact’s sharing settings.
