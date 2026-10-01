# Vasili — sample site (prototype)

A static sample of the full Vasili site with an interactive version of the client's chain drawing hidden inside it. All visible editorial text is placeholder only (`[Heading]`, `[Text]`, `[Product name]`, `[Video]`, `[Ad]` …).

## Pages

| Role | File |
| --- | --- |
| Home | `index.html` |
| Shop / All products | `shop.html` |
| Collections | `collection.html` (frontpage), `collection-bracelet.html`, `collection-earring.html`, `collection-necklace.html`, `collection-object.html`, `collection-ring.html` |
| Products (one template) | `product.html?id=piece-a` … `piece-d` |
| Studio | `about.html`, `preface.html`, `collaborations.html`, `custom-inquiries.html` |
| News | `news.html` (News), `blog.html` + `blog-post.html?id=1-3` (News blog) |
| Help | `faq.html`, `shipping-policy.html`, `return-policy.html` |

The header shows Shop, Collections, About, News and a Menu that reaches every page; the footer repeats the groups. All pages are generated from one template: edit `tools/build-pages.py`, run `python3 tools/build-pages.py`, commit the `.html` output.

## The hidden drawing (not in any navigation)

`map.html` is an interactive redraw of the main sheet (`references/02` + close-ups 03-06): the vertical spiked chain with the eight families arranged around it as drawn. It is deliberately **not** linked from the header, menu, footer or homepage. The only ways in:

- a quiet **See origin** link inside each product's description → opens the map on that piece, focused, with its panel open (`map.html?node=d1-2&piece=piece-a`);
- one FAQ answer → the map overview.

Once inside, visitors can open further hidden layers from each panel:
- **Study** (`map.html?node=…&view=study`): a close view of one drawn form, its branches and neighbours, a collapsed sketch detail cropped from the client's drawing, and a video space. The chain's own study pulls a link apart into its parts.
- **Drawer** (`drawer.html?family=d&from=…`): every form in a family, the related pieces with all their photos (lightbox), and video spaces.

Every hidden view has Close / Back controls, works by keyboard and touch, and keeps its state in the URL, so refresh and the browser's Back button work.

## Data

| File | What it holds |
| --- | --- |
| `data/origin-map.js` | The drawing: node ids, positions and connecting lines in "sheet units" (pixels of the overview photo) |
| `data/demo-connections.js` | **Provisional** piece → drawing links, each shown with `[Connection to confirm]` |
| `data/products.js`, `data/collections.js` | The four sample pieces, their photos and collection membership |
| `assets/web/` | Lighter photo copies (`tools/make-web-images.sh`); `assets/web/sketch/` holds tight crops of the drawings for the sketch details. Originals are untouched. |

To confirm a connection: in `data/demo-connections.js`, set `node` to the right id and `confirmed: true`.

## Deploy on GitHub Pages (main branch, root)

The site is plain HTML/CSS/JavaScript with no build step, so GitHub Pages can serve the repository as-is.

1. Make sure the site files are on `main` (merge the working branch into `main`).
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save**.
3. Wait about a minute (the **Actions** tab shows a "pages build and deployment" run), then open
   **https://bellmorewebdesign.github.io/Vasili/**

Why it works from the root:
- `index.html` is at the repository root, so it is the homepage.
- `.nojekyll` tells GitHub Pages to serve files as they are instead of running Jekyll.
- Every link and asset path is relative (no leading `/`), so it works under the `/Vasili/` subpath.
- Map state lives in the query string (`map.html?node=a1-1`), which needs no server rewrites; refresh, Back and shared links work.

Before pushing changes, run `python3 tools/check-pages.py`. It fails if a file is missing, a path's letter case is wrong (GitHub Pages is case-sensitive even when your computer is not), a link starts with `/`, or a regular page links to the hidden map.

To view locally: run `python3 -m http.server` in this folder and open `http://localhost:8000/`.

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
