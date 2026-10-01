/*
 * DEMO CONNECTIONS — PROVISIONAL, NOT CONFIRMED BY THE CLIENT.
 *
 * The drawings show families of forms, but which finished piece comes from
 * which drawing has not been supplied. These links exist only so the
 * prototype can demonstrate: product description -> "See origin" -> the piece
 * on the drawing, with its panel open. Each is shown with
 * "[Connection to confirm]". The pairings below were chosen by visual
 * similarity only (link bracelets beside the drawn link bracelets, spurred
 * rings beside the drawn spurred rings) and are NOT design history.
 *
 * To update after the client confirms:
 *   - change `node` to the correct id from data/origin-map.js
 *   - set `confirmed: true` (the placeholder tag then disappears)
 *   - `at` is where the photo medallion appears, in sheet units
 */
window.VASILI_CONNECTIONS = [
  { product: "piece-a", node: "d1-2", confirmed: false, at: [112, 563] },
  { product: "piece-d", node: "d3-2", confirmed: false, at: [112, 773] },
  { product: "piece-b", node: "c3",   confirmed: false, at: [300, 370] },
  { product: "piece-c", node: "h5-1", confirmed: false, at: [985, 700] }
];
