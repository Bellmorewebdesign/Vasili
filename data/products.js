/*
 * Sample products for the prototype.
 *
 * Photo groupings come from data/photo-groups.json (the real product galleries
 * on the current site). Display text is placeholder-only on purpose: the client
 * supplies names, details and prices later. `source_handle` is developer
 * reference only and is never shown on the page.
 *
 * `photos` are base names; the page picks assets/web/<base>-<480|960|1600>.jpg.
 * `collections` places each piece by what its photos show (link bracelet,
 * ring). Earring, Necklace and Object have no sample piece yet and show
 * empty placeholder slots.
 */
window.VASILI_PRODUCTS = [
  {
    id: "piece-a",
    collections: ["bracelet", "frontpage"],
    code: "01",
    source_handle: "big-chunky-extendo-bracelet",
    photos: [
      { base: "Capture_One_Catalog0009", alt: "Silver link bracelet with spurred links and an engraved triangular clasp, on white" },
      { base: "DSC09915", alt: "Close view of the silver bracelet links and engraved clasp" },
      { base: "DSC09924", alt: "Close view of the bracelet clasp and engraved detail" },
      { base: "DSC09983", alt: "Angled close view of the spurred links and triangular clasp" },
      { base: "20210107-_F6A3947-Edit", alt: "The silver link bracelet worn on a wrist, with silver rings on the fingers" },
      { base: "cropextedobb", alt: "The silver link chain worn as a necklace over a black turtleneck" }
    ]
  },
  {
    id: "piece-b",
    collections: ["ring", "frontpage"],
    code: "02",
    source_handle: "gold-spur-ring",
    photos: [
      { base: "Capture_One_Catalog0006_07f31f3d-f59c-4f2c-b5cc-4638f0a9559e", alt: "Gold ring made of small spurred links, on white" },
      { base: "VASILI121", alt: "Gold link rings worn on several fingers against black clothing" }
    ]
  },
  {
    id: "piece-c",
    collections: ["ring", "frontpage"],
    code: "03",
    source_handle: "lull-ring",
    photos: [
      { base: "Capture_One_Catalog0004", alt: "Gold ring of rounded spurred links, on white" },
      { base: "VASILI129", alt: "Gold link rings worn on a hand held against black lace" }
    ]
  },
  {
    id: "piece-d",
    collections: ["bracelet", "frontpage"],
    code: "04",
    source_handle: "mirror-link-bracelet-mids",
    photos: [
      { base: "One-Thirty_New_York0539", alt: "Silver chain bracelet of small spurred links, on white" },
      { base: "DCE7A7F3-43BB-4DA7-8AE6-09BA81EF0ECF", alt: "The silver chain bracelet worn while holding a blue bicycle frame" },
      { base: "C8B550E0-0F4B-4EF6-B19E-87D13B946520", alt: "Close view of the silver chain bracelet on a wrist, hand in pocket" },
      { base: "291BC55A-D7C1-4363-A04B-985E4F7EF67F", alt: "Seated figure in black adjusting the silver chain bracelet" },
      { base: "490966CD-BF22-4243-962F-24AF497CCB61", alt: "The silver chain bracelet on a wrist, thumb hooked in a pocket" }
    ]
  }
];
