/*
 * Origin map, transcribed from the client's main sheet.
 *
 * Coordinates are "sheet units": pixels of references/02-origin-map-overview.jpeg
 * after cropping to the paper (x from the photo's left edge, y minus 260).
 * The close-ups (03-06) were used to read the faint connecting lines and
 * the shapes. 03/04 show the same sheet rotated; they are not separate maps.
 *
 * Node ids are stable and used in URLs (map.html?node=d1-2) and in
 * data/demo-connections.js. Family letters follow the sheet:
 *   left of the chain  A studs · B bands & hoops · C spurred rings · D link tree
 *   right of the chain E charms → pendants · F circled link → charms on an arc
 *                      G crosses → pendants · H barbed crescent tree
 *
 * What each form is CALLED, and which piece comes from which drawing, has not
 * been supplied, panels show placeholders. The chain-to-family "traces" shown
 * on selection are a navigation aid, not lines from the drawing.
 *
 *   line     the drawing's connecting line from the parent, in sheet units
 *   anchor   (family heads) index of the chain link the trace starts from
 *   sketch   (family heads) crop in assets/web/sketch/ for the hidden study view
 */
window.VASILI_MAP = {
  bounds: { x: 60, y: 50, w: 980, h: 780 },
  /* The drawing opens on this close view of the chain; forms are revealed
     layer by layer as they are opened (see js/map.js). */
  start: { x: 425, y: 255, w: 190, h: 290 },
  chain: {
    R: 21,
    links: [[520, 148], [545, 233], [500, 310], [462, 386], [506, 466], [525, 550], [550, 647]],
    tips: [{ from: 0, x: 497, y: 84 }, { from: 6, x: 548, y: 740 }],
    sketch: "chain"
  },
  nodes: [
    /* ---------- A · studs (top left) ---------- */
    { id: "a", parent: "chain", x: 415, y: 132, r: 26, circled: true, anchor: 0, sketch: "studs",
      glyph: { type: "stud", rx: 14, ry: 4.5, h: 9, w: 3, open: true } },
    { id: "a1", parent: "a", x: 302, y: 107, r: 11, line: "M389 132H302V119", glyph: { type: "stud", rx: 6, ry: 2.6, h: 11, w: 5.5 } },
    { id: "a2", parent: "a", x: 336, y: 107, r: 10, line: "M389 132H336V117", glyph: { type: "stud", rx: 4.5, ry: 2.2, h: 7, w: 3.6 } },
    { id: "a3", parent: "a", x: 368, y: 107, r: 11, line: "M389 132H368V119", glyph: { type: "stud", rx: 6, ry: 2.6, h: 10, w: 5 } },
    { id: "a4", parent: "a", x: 302, y: 156, r: 10, line: "M389 132H302V148", glyph: { type: "stud", rx: 3.5, ry: 2, h: 8, w: 3.5, ang: -100 } },
    { id: "a5", parent: "a", x: 336, y: 156, r: 10, line: "M389 132H336V148", glyph: { type: "stud", rx: 6, ry: 3.6, h: 5, w: 2.2, open: true } },
    { id: "a6", parent: "a", x: 368, y: 156, r: 10, line: "M389 132H368V148", glyph: { type: "stud", rx: 6, ry: 4.4, h: 3.5, w: 1.6, open: true } },

    /* ---------- B · bands, hoops, clasp chain ---------- */
    { id: "b", parent: "chain", x: 406, y: 282, r: 31, circled: true, anchor: 2, sketch: "hoops",
      glyph: { type: "band", rx: 21, ry: 8 } },
    { id: "b1", parent: "b", x: 406, y: 228, r: 9, line: "M406 251V237", glyph: { type: "lens", rx: 3.5, ry: 6, ang: 70 } },
    { id: "b2", parent: "b", x: 406, y: 332, r: 9, line: "M406 313V323", glyph: { type: "lens", rx: 3.2, ry: 7, ang: 20 } },
    { id: "b3", parent: "b", x: 283, y: 235, r: 18, line: "M375 280H283V244", glyph: { type: "band", rx: 16, ry: 7, gapAt: 10, gap: 70 } },
    { id: "b4", parent: "b", x: 343, y: 235, r: 18, line: "M375 280H343V244", glyph: { type: "band", rx: 16, ry: 7, gapAt: -90, gap: 60 } },
    { id: "b5", parent: "b", x: 283, y: 322, r: 18, line: "M375 280H283V314", glyph: { type: "band", rx: 17, ry: 6.5 } },
    { id: "b6", parent: "b", x: 343, y: 320, r: 18, line: "M375 280H343V312", glyph: { type: "band", rx: 15, ry: 7, gapAt: -150, gap: 70 } },
    { id: "b7", parent: "b", x: 222, y: 285, r: 24, line: "M375 280H238", glyph: { type: "clasp", L: 4.4, pts: [[10, -36], [-30, -5], [26, 36]] } },

    /* ---------- C · spurred rings ---------- */
    { id: "c", parent: "chain", x: 398, y: 466, r: 27, circled: true, anchor: 4, sketch: "rings",
      glyph: { type: "spurCuff", r: 15 } },
    { id: "c1", parent: "c", x: 219, y: 423, r: 15, line: "M371 466H219V437", glyph: { type: "nubRing", r: 12, n: 2 } },
    { id: "c2", parent: "c", x: 268, y: 423, r: 15, line: "M371 466H268V437", glyph: { type: "nubRing", r: 12, n: 4 } },
    { id: "c3", parent: "c", x: 322, y: 423, r: 15, line: "M371 466H322V437", glyph: { type: "nubRing", r: 12, n: 8 } },
    { id: "c4", parent: "c", x: 221, y: 497, r: 10, line: "M371 466H219V488", glyph: { type: "spurCuff", r: 7 } },
    { id: "c5", parent: "c", x: 268, y: 494, r: 8, line: "M371 466H268V488", glyph: { type: "ring", r: 5 } },
    { id: "c6", parent: "c", x: 322, y: 492, r: 7, line: "M371 466H322V487", glyph: { type: "ring", r: 3.4 } },

    /* ---------- D · link tree (lower left, three levels) ---------- */
    { id: "d", parent: "chain", x: 467, y: 662, r: 33, circled: true, anchor: 6, sketch: "links",
      glyph: { type: "chainSeg", R: 7.5, pts: [[-6, -20], [4, 2], [-4, 22]] } },
    { id: "d1", parent: "d", x: 372, y: 553, r: 29, circled: true, line: "M434 662H418V553H401",
      glyph: { type: "segment", p: [-20, 12, 16, -18], L: 8, kind: "oct", bend: 0.15 } },
    { id: "d2", parent: "d", x: 368, y: 663, r: 30, circled: true, line: "M434 662H398",
      glyph: { type: "chainSeg", R: 5.5, pts: [[8, -20], [0, -6], [-4, 8], [-12, 20]] } },
    { id: "d3", parent: "d", x: 374, y: 760, r: 17, line: "M434 662H418V760H392",
      glyph: { type: "arcLinks", rad: 11, a0: -60, a1: 200, L: 6, kind: "oct" } },
    { id: "d1-1", parent: "d1", x: 294, y: 553, r: 20, line: "M343 553H314", glyph: { type: "loop", rx: 17, ry: 15, L: 6, kind: "oct" } },
    { id: "d2-1", parent: "d2", x: 294, y: 663, r: 21, line: "M338 663H314", glyph: { type: "loop", rx: 19, ry: 16, L: 6, kind: "oct" } },
    { id: "d3-1", parent: "d3", x: 294, y: 763, r: 20, line: "M357 760H314", glyph: { type: "loop", rx: 17, ry: 17, L: 5.6, kind: "bead" } },
    { id: "d1-2", parent: "d1-1", x: 218, y: 563, r: 28, line: "M277 556H241", glyph: { type: "loop", rx: 20, ry: 26, L: 6, kind: "oct" } },
    { id: "d2-2", parent: "d2-1", x: 217, y: 667, r: 30, line: "M273 665H234", glyph: { type: "loop", rx: 16, ry: 44, L: 6, kind: "oct" } },
    { id: "d3-2", parent: "d3-1", x: 217, y: 773, r: 28, line: "M274 765H231", glyph: { type: "loop", rx: 13, ry: 38, L: 5.4, kind: "bead" } },

    /* ---------- E · charms → Λ pendants (top right) ---------- */
    { id: "e", parent: "chain", x: 594, y: 181, r: 16, anchor: 1, sketch: "charms",
      glyph: { type: "bracket", h: 96 } },
    { id: "e1", parent: "e", x: 628, y: 86, r: 11, line: "M594 86H617", glyph: { type: "charm", charm: "star", s: 8 } },
    { id: "e2", parent: "e", x: 628, y: 142, r: 11, line: "M594 142H617", glyph: { type: "charm", charm: "pinwheel", s: 9 } },
    { id: "e3", parent: "e", x: 632, y: 192, r: 11, line: "M594 192H620", glyph: { type: "charm", charm: "pretzel", s: 9 } },
    { id: "e4", parent: "e", x: 634, y: 238, r: 11, line: "M594 238H623", glyph: { type: "charm", charm: "heartFlip", s: 8 } },
    { id: "e5", parent: "e", x: 637, y: 277, r: 11, line: "M594 277H626", glyph: { type: "charm", charm: "heart", s: 9 } },
    { id: "e1-1", parent: "e1", x: 730, y: 74, r: 18, line: "M640 86H718", glyph: { type: "pendant", charm: "star", s: 6.5, spread: 26, len: 20 } },
    { id: "e2-1", parent: "e2", x: 690, y: 124, r: 18, line: "M640 142H680", glyph: { type: "pendant", charm: "pinwheel", s: 7, spread: 30, len: 24 } },
    { id: "e3-1", parent: "e3", x: 735, y: 186, r: 22, line: "M644 192H712", glyph: { type: "arch", w: 26, h: 18, s: 6 } },
    { id: "e4-1", parent: "e4", x: 684, y: 228, r: 16, line: "M646 238H673", glyph: { type: "pendant", charm: "heartFlip", s: 6, spread: 32, len: 16 } },
    { id: "e5-1", parent: "e5", x: 735, y: 258, r: 22, line: "M649 277H716", glyph: { type: "pendant", charm: "heart", s: 7, spread: 30, len: 28 } },

    /* ---------- F · circled link with charms on an arc ---------- */
    { id: "f", parent: "chain", x: 812, y: 178, r: 26, circled: true, anchor: 0, sketch: "charms",
      decor: "M834 131A52 52 0 0 1 830 227", glyph: { type: "link", R: 11, ang: -70 } },
    { id: "f1", parent: "f", x: 846, y: 113, r: 11, line: "M836 133L841 122", glyph: { type: "charm", charm: "pretzel", s: 8 } },
    { id: "f2", parent: "f", x: 876, y: 150, r: 11, line: "M860 158L866 155", glyph: { type: "charm", charm: "bow", s: 8 } },
    { id: "f3", parent: "f", x: 875, y: 193, r: 11, line: "M863 189L866 190", glyph: { type: "charm", charm: "ringHeart", s: 7 } },
    { id: "f4", parent: "f", x: 865, y: 230, r: 11, line: "M848 214L857 222", glyph: { type: "charm", charm: "fig8", s: 7 } },

    /* ---------- G · crosses → pendants ---------- */
    { id: "g", parent: "chain", x: 549, y: 438, r: 14, anchor: 4, sketch: "crosses",
      glyph: { type: "bracket", h: 58 } },
    { id: "g1", parent: "g", x: 586, y: 380, r: 13, line: "M549 380H574", glyph: { type: "charm", charm: "cross1", s: 11 } },
    { id: "g2", parent: "g", x: 586, y: 438, r: 13, line: "M549 438H576", glyph: { type: "charm", charm: "cross2", s: 11 } },
    { id: "g3", parent: "g", x: 586, y: 497, r: 13, line: "M549 497H577", glyph: { type: "charm", charm: "cross3", s: 11 } },
    { id: "g1-1", parent: "g1", x: 650, y: 372, r: 20, line: "M598 380H638", glyph: { type: "pendant", charm: "cross1", s: 8, spread: 26, len: 26 } },
    { id: "g2-1", parent: "g2", x: 650, y: 428, r: 20, line: "M598 438H639", glyph: { type: "pendant", charm: "cross2", s: 8, spread: 26, len: 26 } },
    { id: "g3-1", parent: "g3", x: 650, y: 486, r: 20, line: "M598 497H640", glyph: { type: "pendant", charm: "cross3", s: 8, spread: 26, len: 24 } },

    /* ---------- H · barbed crescent tree (right, three levels) ---------- */
    { id: "h", parent: "chain", x: 633, y: 637, r: 32, circled: true, anchor: 6, sketch: "barbed",
      glyph: { type: "barbed", r: 19, a0: 150, a1: 370, L: 6 } },
    { id: "h1", parent: "h", x: 743, y: 366, r: 18, circled: true, line: "M665 637H724V366H725", glyph: { type: "segment", p: [-11, 8, 11, -8], L: 4.6, kind: "thorn", bend: 0.1 } },
    { id: "h2", parent: "h", x: 748, y: 437, r: 19, circled: true, line: "M665 637H724V437H729", glyph: { type: "barbed", r: 11, a0: 190, a1: 350, L: 4 } },
    { id: "h3", parent: "h", x: 756, y: 525, r: 19, circled: true, line: "M665 637H724V525H737", glyph: { type: "arcLinks", rad: 12, a0: 160, a1: 300, L: 4.6, kind: "open", cy: 4 } },
    { id: "h4", parent: "h", x: 761, y: 625, r: 19, circled: true, line: "M665 637H724V625H742", glyph: { type: "segment", p: [-12, 6, 12, -5], L: 4, kind: "thorn", bend: -0.08 } },
    { id: "h5", parent: "h", x: 771, y: 730, r: 19, circled: true, line: "M665 637H724V730H752", glyph: { type: "arcLinks", rad: 13, a0: 200, a1: 340, L: 4.2, kind: "bead", cy: 6 } },
    { id: "h1-1", parent: "h1", x: 821, y: 360, r: 18, line: "M761 366H803", glyph: { type: "loop", rx: 16, ry: 11, L: 4.2, kind: "thorn", wobble: 0.22 } },
    { id: "h2-1", parent: "h2", x: 821, y: 406, r: 16, line: "M767 437H790V406H807", glyph: { type: "loop", rx: 12, ry: 14, L: 4.2, kind: "thorn" } },
    { id: "h2-2", parent: "h2", x: 821, y: 455, r: 16, line: "M767 437H790V455H806", glyph: { type: "loop", rx: 14, ry: 13, L: 4, kind: "thorn" } },
    { id: "h3-1", parent: "h3", x: 821, y: 525, r: 16, line: "M775 525H806", glyph: { type: "spiral", r: 14, L: 4.2 } },
    { id: "h4-1", parent: "h4", x: 821, y: 591, r: 16, line: "M780 625H793V591H808", glyph: { type: "loop", rx: 12, ry: 13, L: 4, kind: "thorn", wobble: 0.25 } },
    { id: "h4-2", parent: "h4", x: 821, y: 645, r: 16, line: "M780 625H793V645H807", glyph: { type: "loop", rx: 13, ry: 14, L: 4, kind: "thorn" } },
    { id: "h5-1", parent: "h5", x: 821, y: 701, r: 14, line: "M790 730H806V701H809", glyph: { type: "loop", rx: 11, ry: 11, L: 3.8, kind: "bead" } },
    { id: "h5-2", parent: "h5", x: 821, y: 742, r: 9, line: "M790 730H806V742H815", glyph: { type: "loop", rx: 5.5, ry: 5.5, L: 2.6, kind: "bead" } },
    { id: "h1-1-1", parent: "h1-1", x: 906, y: 345, r: 24, line: "M837 360H894", glyph: { type: "loop", rx: 11, ry: 23, L: 4, kind: "open" } },
    { id: "h2-1-1", parent: "h2-1", x: 906, y: 413, r: 26, line: "M833 406H889", glyph: { type: "loop", rx: 16, ry: 25, L: 4.4, kind: "thorn" } },
    { id: "h2-2-1", parent: "h2-2", x: 906, y: 465, r: 21, line: "M835 455H893", glyph: { type: "loop", rx: 12, ry: 19, L: 4, kind: "open" } },
    { id: "h3-1-1", parent: "h3-1", x: 906, y: 522, r: 27, line: "M835 525H895", glyph: { type: "loop", rx: 10, ry: 26, L: 4, kind: "open" } },
    { id: "h4-1-1", parent: "h4-1", x: 906, y: 590, r: 23, line: "M833 591H886", glyph: { type: "loop", rx: 19, ry: 22, L: 4.2, kind: "thorn", wobble: 0.12 } },
    { id: "h4-2-1", parent: "h4-2", x: 906, y: 645, r: 25, line: "M834 645H891", glyph: { type: "loop", rx: 14, ry: 24, L: 4.2, kind: "open" } },
    { id: "h5-1-1", parent: "h5-1", x: 906, y: 735, r: 27, line: "M833 701H880V735H886", glyph: { type: "loop", rx: 19, ry: 25, L: 4.2, kind: "open" } }
  ],

  /* Old node ids from the first prototype that no longer exist on the new
     map, so links shared before the rework still land somewhere sensible. */
  aliases: { "a1-1": "d1-2", "a2-1": "d2-1", "a3-1": "d3-2", "e3-2": "h5-1", "a1-2": "d1-2", "a2-2": "d2-2" }
};
