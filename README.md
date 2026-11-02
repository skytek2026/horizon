# Horizon Caption Studio

Image annotation studio for satellite imagery, powered by Skytek. Five pages (sign-in, dashboard, project, editor, settings) built into one self-contained HTML file and hosted as a Claude artifact.

## Layout

- `src/` — page markup (`*.html`), page scripts and shared UI (`assets/js/`), styles (`assets/css/`).
- `build/store.js` — data layer. Projects, images and brand assets live in the artifact's shared database; image files in artifact asset storage. Same `Store` API the pages call.
- `build/shell.js` — single-page router, page lifecycle cleanup, downloads and AI hookups.
- `build/build.py` — assembles everything into `index.html`.
- `index.html` — the built app at the repository root, identical to the published artifact. GitHub Pages serves this file.

## Build

```
python3 build/build.py
```

Requires Python 3 only. The output loads Lucide and JSZip from public CDNs and fonts from Google Fonts.

## Notes

- The built page needs the claude.ai artifact runtime for storage, downloads and the AI assistant. Opened anywhere else (such as GitHub Pages) it shows a Horizon Caption Studio screen with a button that opens the live app on claude.ai.

## GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`.
- The editor’s **Map** tab (callouts, rings, scale bar, track) lives in `src/assets/js/editor.js` as the `Kit` module.
- The sign-in screen is a simple shared gate (`skytek` / `skytek`); real access control is the artifact’s sharing settings.
