/*
 * Origin map layout — an interpretation of references/02-06 (main sheet).
 *
 * Node ids are stable: they are used in URLs (map.html?node=a1-1) and in
 * data/demo-connections.js. Don't rename an id once links are shared; move it
 * or change its glyph instead.
 *
 * Families and their shapes follow the drawing. What each family is CALLED,
 * and which finished piece comes from which drawing, has not been supplied —
 * panels show placeholders until the client provides them.
 *
 * Fields:
 *   parent   id of the node it branches from ("chain" = the central chain)
 *   x, y     position on the 3200 x 2000 canvas
 *   r        click/focus radius; `circled` draws the drawing's ring around it
 *   branch   how lines to children are drawn: "bracket" (default) or "trunk"
 *   glyph    which redrawn shape to show (see js/glyphs.js)
 */
window.VASILI_MAP = {
  width: 3200,
  height: 2000,
  chain: { x0: 330, x1: 2870, y: 1000, amp: 70, waves: 1.5, links: 11, R: 56 },
  nodes: [
    /* Above the chain — link family (circled segments -> bracelet loops) */
    { id: "a", parent: "chain", x: 640, y: 700, r: 92, circled: true, glyph: { type: "arcChain", cy: 30, rad: 66, a0: 200, a1: 340, n: 3, R: 13 } },
    { id: "a1", parent: "a", x: 400, y: 520, r: 60, circled: true, glyph: { type: "arcLinks", cy: 16, rad: 42, a0: 195, a1: 345, L: 20 } },
    { id: "a2", parent: "a", x: 640, y: 520, r: 60, circled: true, glyph: { type: "arcChain", cy: 22, rad: 44, a0: 200, a1: 340, n: 3, R: 8 } },
    { id: "a3", parent: "a", x: 880, y: 520, r: 60, circled: true, glyph: { type: "arcLinks", cy: 16, rad: 42, a0: 195, a1: 345, L: 16, open: true } },
    { id: "a1-1", parent: "a1", x: 400, y: 360, r: 58, glyph: { type: "loop", rx: 46, ry: 42, L: 19 } },
    { id: "a2-1", parent: "a2", x: 640, y: 360, r: 58, glyph: { type: "loop", rx: 44, ry: 44, L: 16, open: true } },
    { id: "a3-1", parent: "a3", x: 880, y: 360, r: 58, glyph: { type: "loop", rx: 46, ry: 40, L: 15, open: true } },
    { id: "a1-2", parent: "a1-1", x: 400, y: 200, r: 60, glyph: { type: "loop", rx: 70, ry: 34, L: 18 } },
    { id: "a2-2", parent: "a2-1", x: 640, y: 200, r: 60, glyph: { type: "loop", rx: 74, ry: 30, L: 15, open: true } },

    /* Above — open cuff family (cuff -> spurred rings) */
    { id: "b", parent: "chain", x: 1380, y: 700, r: 80, circled: true, branch: "trunk", glyph: { type: "cuff", r: 38 } },
    { id: "b1", parent: "b", x: 1290, y: 550, r: 40, glyph: { type: "spikedRing", r: 18, n: 6 } },
    { id: "b2", parent: "b", x: 1470, y: 430, r: 46, glyph: { type: "spikedRing", r: 25, n: 8 } },
    { id: "b3", parent: "b", x: 1290, y: 300, r: 50, glyph: { type: "spikedRing", r: 31, n: 10 } },

    /* Above — hoop family */
    { id: "c", parent: "chain", x: 1980, y: 700, r: 82, circled: true, branch: "trunk", glyph: { type: "hoop", rx: 20, ry: 44 } },
    { id: "c1", parent: "c", x: 1880, y: 550, r: 40, glyph: { type: "cshape", r: 28 } },
    { id: "c2", parent: "c", x: 2080, y: 550, r: 40, glyph: { type: "cshape", r: 28, flip: true } },
    { id: "c3", parent: "c", x: 1880, y: 410, r: 40, glyph: { type: "hoop", rx: 14, ry: 30 } },
    { id: "c4", parent: "c", x: 2080, y: 410, r: 40, glyph: { type: "cshape", r: 22, flip: true } },
    { id: "c5", parent: "c", x: 1980, y: 250, r: 70, glyph: { type: "claspChain", r: 70 } },

    /* Above — stud family */
    { id: "d", parent: "chain", x: 2480, y: 700, r: 66, circled: true, branch: "trunk", glyph: { type: "stud", r: 16 } },
    { id: "d1", parent: "d", x: 2400, y: 560, r: 30, glyph: { type: "stud", r: 10 } },
    { id: "d2", parent: "d", x: 2560, y: 470, r: 30, glyph: { type: "stud", r: 12 } },
    { id: "d3", parent: "d", x: 2400, y: 380, r: 30, glyph: { type: "stud", r: 14 } },

    /* Above — chain studies (references/01, 07, 08) */
    { id: "k", parent: "chain", x: 2860, y: 720, r: 64, circled: true, glyph: { type: "pair", L: 26 } },
    { id: "k1", parent: "k", x: 2790, y: 380, r: 60, glyph: { type: "strand", len: 300, L: 22 } },
    { id: "k2", parent: "k", x: 2930, y: 380, r: 60, glyph: { type: "strand", len: 300, L: 26, open: true, wave: 6 } },

    /* Below the chain — barbed family (several levels) */
    { id: "e", parent: "chain", x: 600, y: 1320, r: 100, circled: true, glyph: { type: "barbed", r: 58 } },
    { id: "e1", parent: "e", x: 240, y: 1540, r: 54, circled: true, glyph: { type: "arcLinks", rad: 32, a0: 120, a1: 300, L: 15 } },
    { id: "e2", parent: "e", x: 420, y: 1540, r: 54, circled: true, glyph: { type: "arcLinks", rad: 32, a0: 150, a1: 330, L: 13, open: true } },
    { id: "e3", parent: "e", x: 600, y: 1540, r: 54, circled: true, glyph: { type: "arcLinks", rad: 30, a0: 100, a1: 260, L: 14 } },
    { id: "e4", parent: "e", x: 780, y: 1540, r: 54, circled: true, glyph: { type: "arcLinks", rad: 32, a0: 170, a1: 370, L: 12, open: true } },
    { id: "e5", parent: "e", x: 960, y: 1540, r: 54, circled: true, glyph: { type: "arcChain", rad: 30, a0: 150, a1: 300, n: 3, R: 7 } },
    { id: "e1-1", parent: "e1", x: 240, y: 1720, r: 54, glyph: { type: "loop", rx: 40, ry: 44, L: 14 } },
    { id: "e2-1", parent: "e2", x: 420, y: 1720, r: 54, glyph: { type: "loop", rx: 38, ry: 44, L: 12, open: true } },
    { id: "e3-1", parent: "e3", x: 600, y: 1720, r: 54, glyph: { type: "loop", rx: 36, ry: 38, L: 13 } },
    { id: "e4-1", parent: "e4", x: 780, y: 1720, r: 54, glyph: { type: "loop", rx: 34, ry: 42, L: 11, open: true } },
    { id: "e5-1", parent: "e5", x: 960, y: 1720, r: 54, glyph: { type: "loop", rx: 40, ry: 40, L: 12 } },
    { id: "e3-2", parent: "e3-1", x: 600, y: 1880, r: 36, glyph: { type: "loop", rx: 20, ry: 20, L: 10 } },

    /* Below — cross family (cross -> cross pendants) */
    { id: "f", parent: "chain", x: 1460, y: 1300, r: 80, circled: true, glyph: { type: "cross", s: 42 } },
    { id: "f1", parent: "f", x: 1300, y: 1470, r: 44, glyph: { type: "cross", s: 30, up: 0.75, down: 1.0, side: 0.75 } },
    { id: "f2", parent: "f", x: 1460, y: 1470, r: 44, glyph: { type: "cross", s: 30, up: 0.8, down: 1.2, side: 0.7 } },
    { id: "f3", parent: "f", x: 1620, y: 1470, r: 44, glyph: { type: "cross", s: 30, up: 0.7, down: 1.3, side: 0.62 } },
    { id: "f1-1", parent: "f1", x: 1300, y: 1680, r: 56, glyph: { type: "pendant", s: 56, charm: "cross" } },
    { id: "f2-1", parent: "f2", x: 1460, y: 1680, r: 56, glyph: { type: "pendant", s: 56, charm: "cross" } },
    { id: "f3-1", parent: "f3", x: 1620, y: 1680, r: 56, glyph: { type: "pendant", s: 56, charm: "cross" } },

    /* Below — charm family (charms -> pendants) */
    { id: "g", parent: "chain", x: 2260, y: 1300, r: 80, circled: true, glyph: { type: "charm", charm: "knot", s: 36 } },
    { id: "g1", parent: "g", x: 2020, y: 1470, r: 40, glyph: { type: "charm", charm: "star", s: 24 } },
    { id: "g2", parent: "g", x: 2140, y: 1470, r: 40, glyph: { type: "charm", charm: "flower", s: 24 } },
    { id: "g3", parent: "g", x: 2260, y: 1470, r: 40, glyph: { type: "charm", charm: "knot", s: 22 } },
    { id: "g4", parent: "g", x: 2380, y: 1470, r: 40, glyph: { type: "charm", charm: "spade", s: 20 } },
    { id: "g5", parent: "g", x: 2500, y: 1470, r: 40, glyph: { type: "charm", charm: "heart", s: 24 } },
    { id: "g1-1", parent: "g1", x: 2020, y: 1680, r: 56, glyph: { type: "pendant", s: 52, charm: "star" } },
    { id: "g4-1", parent: "g4", x: 2380, y: 1680, r: 56, glyph: { type: "pendant", s: 52, charm: "spade" } },
    { id: "g5-1", parent: "g5", x: 2500, y: 1680, r: 56, glyph: { type: "pendant", s: 52, charm: "heart" } }
  ]
};
