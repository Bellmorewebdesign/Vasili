# Vasili — sample site (prototype)

The sample site is now built in this repository: `index.html` (home), `map.html` (explore / origin map), `collection.html`, and `product.html?id=…` (one reusable product layout). All visible editorial text is placeholder only.

## View it

- **GitHub Pages:** Settings → Pages → Deploy from a branch → choose the branch and `/ (root)`. Everything uses relative paths, so it works under `https://<user>.github.io/<repo>/`.
- **Locally:** run `python3 -m http.server` in this folder and open `http://localhost:8000/`.

## Where things live

| File | What it holds |
| --- | --- |
| `data/origin-map.js` | Map nodes: stable ids, positions, which redrawn shape each shows |
| `data/demo-connections.js` | **Provisional** piece → node links (each shows `[Connection to confirm]`) |
| `data/products.js` | The four sample pieces and their photos (placeholder text only) |
| `js/glyphs.js` | Vector redraws of the shapes in the client drawings |
| `js/map.js` | Map pan/zoom, selection, URL state, detail panel |
| `assets/web/` | Lighter copies of the photos, made by `tools/make-web-images.sh`; originals in `assets/photos/` are untouched |

Map URLs: `map.html?node=a1-1` opens that node's panel; `&piece=piece-a` opens a piece inside it. Every product page's **See origin** links to its node this way.

To confirm a connection: in `data/demo-connections.js`, set `node` to the right id and `confirmed: true`.

---

# Vasili — assets and Claude handoff

This is an input kit for building one visual prototype, not an already-built website.

## Use

1. Unzip this archive on your computer.
2. Upload its CONTENTS into your GitHub repository root. `README.md`, `CLAUDE_PROMPT.md`, `ASSET_GUIDE.md`, `assets/`, `references/`, and `data/` belong at the top level; don't upload just the ZIP or add an extra enclosing folder.
3. Connect Claude to that repository and paste the contents of `CLAUDE_PROMPT.md`, or tell Claude to follow that file.
4. Claude creates the site files. This kit has no `index.html`; it will not display a homepage until the prototype is built.

## Included

- One byte-identical copy of each distinct downloaded site asset, with original image quality preserved.
- The existing white vector logo from the public site.
- All eight client-supplied drawing photographs, with descriptive filenames.
- The supplied unfinished-homepage screenshot.
- The originally supplied black-logo JPG, preserved as a reference only; this file is a solid black rectangle and should not be used as the visible logo.
- Asset metadata, source URLs, hashes, and input filename mappings.
- A focused Claude prompt based on the user's notes and explanation.

The photo archive was collected from the public vasili.nyc website on 2026-10-01 UTC (September 30 in New York). Repeated downloads are consolidated. Original Shopify page HTML, scripts, tracking, old copy, and price data are intentionally not included in this prototype input kit. The earlier full extraction archive remains a separate deliverable.

## Scope and boundaries

The prototype should communicate aesthetics and the branching, exploratory origin system. Final editorial copy, videos, the ad content, node labels, and exact product ancestry are pending. No new artwork, factual genealogy, or final brand narrative has been authored in this kit. The client's original drawings remain the visual authority.

Use these assets only for this authorized client project. Nothing in this kit is a statement that the assets have an open-source license. Upload to the repository/audience intended for the client's demo; raw reference photos will be downloadable if included in a public repository or its published output.

The supplied photographs of paper include hands/backgrounds. They are design references, not finished page art. Don't display the whole reference photographs as public website sections. The white SVG is the existing site's version of the logo; a usable version of the client's thicker black logo is still needed if that exact weight is desired.
