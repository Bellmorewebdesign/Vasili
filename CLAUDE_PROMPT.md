# Build the first Vasili visual prototype

Use the assets already in this repository to build ONE cohesive sample website for Vasili, an American traditional tattoo-inspired jewelry brand. This is a design demonstration for the client, not a finished store. Make the actual working layout and interactions, not just a plan. Read `README.md`, `ASSET_GUIDE.md`, and the client drawings in `references/` first. Inspect the supplied photos before deciding where to use them.

## Creative direction

The client wants more of an art showcase and experience than a conventional jewelry shop. His comparison was “Yeezy, not Nike”: unusual, simple but interesting, distinctive, special, and luxurious. He describes his work as a thesis and wants visitors to discover why it is different. Use a cool-blue, slightly eerie atmosphere. The jewelry photographs should be the brightest and most prominent elements. Use the real Vasili logo provided in `assets/brand/vasili-logo-white.svg`.

His Pokémon comparison means the experience of clicking, exploring, and discovering connections. It does NOT mean Pokémon characters, artwork, game graphics, or copying its interface. Give the design a deliberate visual identity based on HIS artwork. Avoid a generic template, repetitive rounded cards, decorative gradient blobs, and a standard marketing-page section stack. Keep the actual jewelry recognizable; don't replace it with generated products or stock jewelry. The unfinished homepage screenshot is existing context, not a layout or color scheme to reproduce.

## Text: placeholders only

The client will supply his own writing. Do not write marketing copy, a brand story, a thesis, product descriptions, slogans, prices, testimonials, or claims. Do not reuse copy or prices from the extracted site. Use short, restrained placeholders such as `[Heading]`, `[Text]`, `[Product name]`, `[Product details]`, `[Video]`, and `[Ad]` only where needed to demonstrate the layout. Don't fill the design with paragraphs of lorem ipsum. The real logo and short functional labels such as Explore, Collection, Back, Close, and See origin are fine. Accessibility labels can describe controls normally.

## Structure

Create a homepage, one reusable collection-page layout, one reusable product-page layout, and the interactive origin-map experience described below. These belong to one site, not separate alternative designs. Use the included photos throughout. Show the general structure without pretending the complete future catalog is known.

Leave visually considered spaces for client-supplied videos across the site, including in a detail panel if appropriate. Include a clearly marked ad placeholder without inventing an ad or inserting a real ad network. These are empty media placements, not fake playback controls that pretend a video exists. Include a restrained email-field layout near page bottoms for a future Shopify connection; do not collect or transmit submissions in this prototype.

## Interactive origin map — the central experience

Use `references/02-origin-map-overview.jpeg` and the detail photos as the main visual references. They show a large chain drawing with branches, component drawings, and jewelry forms derived from those components. The term “origin map” is just a working description, not final client-facing copy.

Build a large, explorable illustrated canvas with the chain as its central feature. Translate the supplied drawings into clean scalable linework where feasible, maintaining their recognizable shapes. Keep the original reference photos unchanged. Do not simply display the photographed paper as the finished interactive page. A restrained animation should help reveal or navigate the artwork.

Visitors should be able to move around the composition, click a branch or component, discover related jewelry, and click a jewelry item for a popup/detail panel. The panel should have its real product photo and placeholder text, with space for a future video where appropriate. Allow exploration onward to connected pieces or back toward their origin. Make more than one level of branching work in the sample so the idea is actually demonstrable.

Every sample product page needs a “See origin” link. It must return to the map, focus the specific relevant node, and automatically open that node's panel—not just link to the map's beginning. Give nodes stable identifiers and preserve the selected node in the URL so direct links, refresh, and browser Back work. Keep a clear way to close panels, return to the overview, and access the collection without solving the map.

The exact names and complete product-to-drawing relationships have NOT been supplied. Don't present guessed ancestry as established fact. Use a small set of clearly identified demo connections, record them separately in data, and mark provisional panels with a restrained `[Connection to confirm]` placeholder. Keep the node/product mapping easy to replace when the client confirms it. Do not invent new jewelry designs to fill missing branches.

## Implementation and checks

This will live on GitHub Pages, including under a repository subpath. Keep it static and straightforward; plain HTML/CSS/JavaScript is suitable. Use relative local asset paths and routing that works on GitHub Pages without server rewrites. Use `data/assets.json` to locate source photos, and create lighter web copies where needed without changing the originals. Don't load every full-size photograph into the initial viewport.

Make the prototype work on desktop and phone: touch-friendly map navigation, legible panels, usable close/back controls, keyboard-accessible interactive elements, and reduced-motion support. Don't depend on hover alone. Use real buttons/links and descriptive alt text even though visible editorial copy is placeholder-only.

Do not wire payments, checkout, Shopify, analytics, email collection, or ads. Don't change the live vasili.nyc website. Build only this sample in the current repository. Finish by testing the map → detail → product → See origin round trip, direct origin links, refresh/Back, mobile layout, and asset loading at a repository subpath. Summarize what works and which artwork connections remain provisional.
