/*
 * DEMO CONNECTIONS — PROVISIONAL, NOT CONFIRMED BY THE CLIENT.
 *
 * Which drawing each piece descends from has not been supplied. These links
 * exist only so the prototype can demonstrate the map -> piece -> "See origin"
 * round trip. Every entry is shown on the site with "[Connection to confirm]".
 *
 * To update after the client confirms:
 *   - change `node` to the correct node id from data/origin-map.js
 *   - set `confirmed: true` (the placeholder tag then disappears)
 *   - `at` is where the photo medallion sits on the map canvas (x, y)
 */
window.VASILI_CONNECTIONS = [
  { product: "piece-a", node: "a1-1", confirmed: false, at: [205, 330] },
  { product: "piece-d", node: "a3-1", confirmed: false, at: [1075, 330] },
  { product: "piece-b", node: "b2",   confirmed: false, at: [1650, 300] },
  { product: "piece-c", node: "e3-2", confirmed: false, at: [800, 1880] }
];
