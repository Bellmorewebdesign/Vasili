/*
 * Vector redraws of the client's drawings (references/02-08).
 * All sizes are in "sheet units": pixels of the overview photo crop
 * (references/02-origin-map-overview.jpeg, paper area), so shapes can be
 * compared directly against the photographed sheet.
 *
 * Each function returns SVG markup drawn around (0,0). Styling comes from CSS:
 *   .g-fill   outline filled with the background colour
 *   .g-thin   hairline detail
 *   .g-ink    the heavy outline of the main chain
 *   .fa / .fb the two shaded facets (light / dark) of the drawn chain
 */
(function () {
  "use strict";
  var f = function (n) { return Math.round(n * 100) / 100; };
  var rad = function (d) { return d * Math.PI / 180; };
  var P = function (x, y) { return f(x) + " " + f(y); };
  function g(x, y, ang, body, sc) {
    return '<g transform="translate(' + P(x, y) + ")" + (ang ? " rotate(" + f(ang) + ")" : "") + (sc ? " scale(" + f(sc) + ")" : "") + '">' + body + "</g>";
  }

  /* ------------------------------------------------------------------
   * Main chain (sheet 02/03/04): round link with a figure-8 opening along
   * the chain, an onion-dome point on each side carrying two shaded facets,
   * and a faceted double-pointed connector lying over the band.
   * Local axis: x = along the chain.
   * ------------------------------------------------------------------ */
  function linkOutline(R) {
    // round ends along the chain; broad convex shoulders sweeping into a
    // concave onion-dome point on each side (as on the drawn sheet)
    var r = function (a, b) { return P(a * R, b * R); };
    var half = function (k) {
      return "C" + r(-1, -0.52 * k) + " " + r(-0.92, -0.86 * k) + " " + r(-0.62, -0.98 * k) +
        "C" + r(-0.36, -1.06 * k) + " " + r(-0.1, -1.08 * k) + " " + r(0, -1.36 * k) +
        "C" + r(0.1, -1.08 * k) + " " + r(0.36, -1.06 * k) + " " + r(0.62, -0.98 * k) +
        "C" + r(0.92, -0.86 * k) + " " + r(1, -0.52 * k) + " " + r(1, 0);
    };
    return "M" + r(-1, 0) + half(1) + "C" + r(1, 0.52) + " " + r(0.92, 0.86) + " " + r(0.62, 0.98) +
      "C" + r(0.36, 1.06) + " " + r(0.1, 1.08) + " " + r(0, 1.36) +
      "C" + r(-0.1, 1.08) + " " + r(-0.36, 1.06) + " " + r(-0.62, 0.98) +
      "C" + r(-0.92, 0.86) + " " + r(-1, 0.52) + " " + r(-1, 0) + "Z";
  }
  function linkHole(R) {
    var r = function (a, b) { return P(a * R, b * R); }, lr = 0.37 * R;
    return "M" + r(0, -0.2) +
      "C" + r(0.1, -0.35) + " " + r(0.26, -0.37) + " " + r(0.44, -0.37) +
      "A" + f(lr) + " " + f(lr) + " 0 0 1 " + r(0.44, 0.37) +
      "C" + r(0.26, 0.37) + " " + r(0.1, 0.35) + " " + r(0, 0.2) +
      "C" + r(-0.1, 0.35) + " " + r(-0.26, 0.37) + " " + r(-0.44, 0.37) +
      "A" + f(lr) + " " + f(lr) + " 0 0 1 " + r(-0.44, -0.37) +
      "C" + r(-0.26, -0.37) + " " + r(-0.1, -0.35) + " " + r(0, -0.2) + "Z";
  }
  function chainLink(x, y, ang, R) {
    var t = function (a, b) { return P(a * R, b * R); };
    var facets =
      '<path class="fa" d="M' + t(0, -1.3) + "L" + t(0, -0.27) + "L" + t(-0.6, -0.86) + 'Z"/>' +
      '<path class="fb" d="M' + t(0, -1.3) + "L" + t(0, -0.27) + "L" + t(0.6, -0.86) + 'Z"/>' +
      '<path class="fb" d="M' + t(0, 1.3) + "L" + t(0, 0.27) + "L" + t(-0.6, 0.86) + 'Z"/>' +
      '<path class="fa" d="M' + t(0, 1.3) + "L" + t(0, 0.27) + "L" + t(0.6, 0.86) + 'Z"/>';
    return g(x, y, ang,
      '<path class="g-link" fill-rule="evenodd" d="' + linkOutline(R) + linkHole(R) + '"/>' + facets +
      '<path class="g-thin" d="M0 ' + f(-0.22 * R) + "V" + f(-1.3 * R) + "M0 " + f(0.22 * R) + "V" + f(1.3 * R) + '"/>' +
      '<path class="g-ink" d="' + linkOutline(R) + linkHole(R) + '"/>');
  }
  /* Double-pointed connector bar between two points, widest in the middle. */
  function connector(x1, y1, x2, y2, R, endTip) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    var at = function (s, w) { return P(x1 + ux * s + nx * w, y1 + uy * s + ny * w); };
    var e = 0.15 * R, wMid = 0.6 * R, m = endTip ? L * 0.3 : L * 0.46;
    var d = "M" + at(0, -e) + "L" + at(m, -wMid) + (endTip ? "L" + at(L, 0) : "L" + at(L, -e) +
      "A" + f(e) + " " + f(e) + " 0 0 1 " + at(L, e)) + "L" + at(m, wMid) + "L" + at(0, e) +
      "A" + f(e) + " " + f(e) + " 0 0 1 " + at(0, -e) + "Z";
    var shade = '<path class="fb" d="M' + at(m, -wMid) + "L" + at(m, wMid) + "L" + at(m + (L - m) * 0.62, 0) + 'Z"/>';
    return '<path class="g-link" d="' + d + '"/>' + shade +
      '<path class="g-thin" d="M' + at(m, -wMid) + "L" + at(m, wMid) + '"/>' +
      '<path class="g-ink" d="' + d + '"/>';
  }
  /* A full chain through points: links underneath, connectors over the band. */
  function chain(pts, R, tips) {
    var links = "", bars = "", n = pts.length, i;
    var dir = function (i) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    };
    for (i = 0; i < n; i++) links += '<g class="c-link" style="--i:' + i + '">' + chainLink(pts[i].x, pts[i].y, dir(i), R) + "</g>";
    for (i = 0; i < n - 1; i++) {
      var a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / L, uy = (b.y - a.y) / L;
      bars += '<g class="c-bar" style="--i:' + (i + 0.5) + '">' +
        connector(a.x + ux * 0.5 * R, a.y + uy * 0.5 * R, b.x - ux * 0.5 * R, b.y - uy * 0.5 * R, R) + "</g>";
    }
    if (tips) {
      tips.forEach(function (t) {
        var p = pts[t.from], L = Math.hypot(t.x - p.x, t.y - p.y), ux = (t.x - p.x) / L, uy = (t.y - p.y) / L;
        bars += '<g class="c-bar" style="--i:' + (t.from === 0 ? -0.5 : n - 0.5) + '">' +
          connector(p.x + ux * 0.5 * R, p.y + uy * 0.5 * R, t.x, t.y, R, true) + "</g>";
      });
    }
    return links + bars;
  }
  function arcPoints(cx, cy, r, a0, a1, n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = rad(a0 + (a1 - a0) * (n === 1 ? 0.5 : i / (n - 1)));
      pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    return pts;
  }

  /* ------------------------------------------------------------------
   * Small chain links used in the loops, studies and segments.
   * ------------------------------------------------------------------ */
  /* Thorn link from the chain studies (01, 07, 08). */
  function tlink(x, y, ang, L, open) {
    var rx = L * 0.5, ry = L * 0.34, t = L * 0.56, w = L * 0.1;
    var inner = open ? '<ellipse class="g-thin" rx="' + f(rx * 0.6) + '" ry="' + f(ry * 0.48) + '"/>'
      : '<path class="g-thin" d="M' + P(-rx * 0.4, -ry * 0.4) + "L" + P(rx * 0.4, ry * 0.4) + "M" + P(-rx * 0.4, ry * 0.4) + "L" + P(rx * 0.4, -ry * 0.4) + '"/>';
    return g(x, y, ang,
      '<path class="g-fill" d="M' + P(-w, -ry + 0.2) + "L" + P(0, -t) + "L" + P(w, -ry + 0.2) + "M" + P(-w, ry - 0.2) + "L" + P(0, t) + "L" + P(w, ry - 0.2) + '"/>' +
      '<ellipse class="g-fill" rx="' + f(rx) + '" ry="' + f(ry) + '"/>' + inner);
  }
  /* Faceted octagonal link (circled link segments, lower left). */
  function octLink(x, y, ang, L) {
    var pts = [], i, a = L * 0.5, b = L * 0.32;
    for (i = 0; i < 8; i++) { var t = rad(22.5 + i * 45); pts.push(P(a * Math.cos(t) * 1.08, b * Math.sin(t) * 1.25)); }
    return g(x, y, ang, '<path class="g-fill" d="M' + pts.join("L") + 'Z"/>' +
      '<rect class="g-thin" x="' + f(-a * 0.45) + '" y="' + f(-b * 0.4) + '" width="' + f(a * 0.9) + '" height="' + f(b * 0.8) + '"/>' +
      '<path class="g-fill" d="M' + P(-a * 0.2, -b * 1.25) + "L" + P(0, -b * 1.75) + "L" + P(a * 0.2, -b * 1.25) + 'Z"/>');
  }
  function bead(x, y, r) { return '<circle class="g-fill" cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '"/>'; }

  /* Links laid along any sampled path: kinds thorn | open | oct | bead | ring */
  function linksAlong(pts, L, kind) {
    var out = "";
    for (var i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      if (kind === "oct") out += octLink(pts[i].x, pts[i].y, ang, L);
      else if (kind === "bead") out += (i % 2 ? bead(pts[i].x, pts[i].y, L * 0.22) : tlink(pts[i].x, pts[i].y, ang, L, true));
      else if (kind === "ring") out += '<circle class="g-fill" cx="' + f(pts[i].x) + '" cy="' + f(pts[i].y) + '" r="' + f(L * 0.42) + '"/>';
      else out += tlink(pts[i].x, pts[i].y, ang, L, kind === "open");
    }
    return out;
  }
  function samplePath(fn, step) {
    // fn(t) for t in [0,1]; returns points roughly `step` apart
    var pts = [fn(0)], last = pts[0], N = 400;
    for (var i = 1; i <= N; i++) {
      var p = fn(i / N);
      if (Math.hypot(p.x - last.x, p.y - last.y) >= step) { pts.push(p); last = p; }
    }
    return pts;
  }
  /* Closed bracelet of links; `wobble` makes the hand-drawn irregular loops. */
  function loop(rx, ry, L, kind, wobble) {
    var w = wobble || 0;
    var pts = samplePath(function (t) {
      var a = t * Math.PI * 2, k = 1 + w * Math.sin(a * 3 + 0.7) * 0.5 + w * Math.cos(a * 2) * 0.3;
      return { x: rx * k * Math.cos(a), y: ry * k * Math.sin(a) };
    }, L * 0.78);
    if (pts.length > 2 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < L * 0.5) pts.pop();
    return linksAlong(pts, L, kind);
  }
  /* "G" spiral (right-hand tree). */
  function spiral(r, L) {
    var pts = samplePath(function (t) {
      var a = rad(-40) + t * Math.PI * 3.1, rr = r * (1 - t * 0.62);
      return { x: rr * Math.cos(a), y: rr * Math.sin(a) };
    }, L * 0.8);
    return linksAlong(pts, L, "thorn");
  }
  /* Short chain along an arc, optionally barbed. */
  function arcLinks(r, a0, a1, L, kind, cx, cy) {
    var pts = samplePath(function (t) {
      var a = rad(a0 + (a1 - a0) * t);
      return { x: (cx || 0) + r * Math.cos(a), y: (cy || 0) + r * Math.sin(a) };
    }, L * 0.8);
    return linksAlong(pts, L, kind);
  }
  function segment(x1, y1, x2, y2, L, kind, bend) {
    var mx = (x1 + x2) / 2 - (y2 - y1) * (bend || 0), my = (y1 + y2) / 2 + (x2 - x1) * (bend || 0);
    var pts = samplePath(function (t) {
      var u = 1 - t;
      return { x: u * u * x1 + 2 * u * t * mx + t * t * x2, y: u * u * y1 + 2 * u * t * my + t * t * y2 };
    }, L * 0.8);
    return linksAlong(pts, L, kind);
  }
  /* Barbed links: interlocking rings with thorns (circled crescent, right). */
  function barbed(r, a0, a1, L) {
    var pts = samplePath(function (t) {
      var a = rad(a0 + (a1 - a0) * t);
      return { x: r * Math.cos(a), y: r * Math.sin(a) };
    }, L * 0.72), out = "";
    pts.forEach(function (p, i) {
      out += '<circle class="g-fill" cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="' + f(L * 0.55) + '"/>' +
        '<circle class="g-thin" cx="' + f(p.x) + '" cy="' + f(p.y) + '" r="' + f(L * 0.3) + '"/>';
      if (i % 2 === 0) {
        var a = Math.atan2(p.y, p.x), c = Math.cos(a), s = Math.sin(a), o = L * 0.5, h = L * 0.75;
        out += '<path class="g-fill" d="M' + P(p.x + c * o - s * 2, p.y + s * o + c * 2) + "L" + P(p.x + c * (o + h), p.y + s * (o + h)) +
          "L" + P(p.x + c * o + s * 2, p.y + s * o - c * 2) + 'Z"/>';
      }
    });
    return out;
  }

  /* ------------------------------------------------------------------
   * Rings, cuffs, bands, studs (left side of the sheet)
   * ------------------------------------------------------------------ */
  /* Ring with small spur nubs. */
  function nubRing(r, n) {
    var out = '<circle class="g-fill" r="' + f(r) + '"/><circle class="g-thin" r="' + f(r * 0.82) + '"/>';
    for (var i = 0; i < n; i++) {
      var a = rad(180 + 360 * i / n), c = Math.cos(a), s = Math.sin(a), w = Math.max(0.9, r * 0.12);
      out += '<path class="g-fill" d="M' + P(r * c - w * s, r * s + w * c) + "L" + P(r * 1.24 * c, r * 1.24 * s) + "L" + P(r * c + w * s, r * s - w * c) + 'Z"/>';
    }
    return out;
  }
  /* Open ring ending in an arrow spur (circled "C", left middle). */
  function spurCuff(r) {
    var ri = r * 0.8, a0 = rad(60), a1 = rad(60 + 300);
    var pt = function (rr, a) { return P(rr * Math.cos(a), rr * Math.sin(a)); };
    var d = "M" + pt(r, a0) + "A" + f(r) + " " + f(r) + " 0 1 1 " + pt(r, a1) + "L" + pt(ri, a1) + "A" + f(ri) + " " + f(ri) + " 0 1 0 " + pt(ri, a0) + "Z";
    var m = (r + ri) / 2, tip = a1 + rad(14), back = a1 - rad(4);
    var arrow = "M" + pt(m + r * 0.32, back) + "L" + pt(m, tip) + "L" + pt(m - r * 0.32, back) + "Z";
    return '<path class="g-fill" d="' + d + '"/><path class="g-fill" d="' + arrow + '"/>';
  }
  /* Band seen in perspective, optionally open (gap centred at gapAt deg). */
  function band(rx, ry, gapAt, gapDeg) {
    var irx = rx * 0.84, iry = ry * 0.5, oy = -ry * 0.12;
    if (gapDeg == null) {
      return '<ellipse class="g-fill" rx="' + f(rx) + '" ry="' + f(ry) + '"/>' +
        '<ellipse class="g-thin" cy="' + f(oy) + '" rx="' + f(irx) + '" ry="' + f(iry) + '"/>' +
        '<path class="g-thin" d="M' + P(-rx * 0.92, ry * 0.15) + "Q" + P(0, ry * 1.25) + " " + P(rx * 0.92, ry * 0.15) + '"/>';
    }
    var a0 = rad(gapAt + gapDeg / 2), a1 = rad(gapAt - gapDeg / 2 + 360);
    var o = function (a) { return P(rx * Math.cos(a), ry * Math.sin(a)); };
    var i = function (a) { return P(irx * Math.cos(a), oy + iry * Math.sin(a)); };
    var large = (360 - gapDeg) > 180 ? 1 : 0;
    var d = "M" + o(a0) + "A" + f(rx) + " " + f(ry) + " 0 " + large + " 1 " + o(a1) + "L" + i(a1) +
      "A" + f(irx) + " " + f(iry) + " 0 " + large + " 0 " + i(a0) + "Z";
    return '<path class="g-fill" d="' + d + '"/>';
  }
  function lens(rx, ry) {
    var d = "M0 " + f(-ry) + "Q" + P(rx * 1.6, 0) + " 0 " + f(ry) + "Q" + P(-rx * 1.6, 0) + " 0 " + f(-ry) + "Z";
    return '<path class="g-fill" d="' + d + '"/><path class="g-thin" transform="scale(.55)" d="' + d + '"/>';
  }
  /* Stud: oval base with an onion-dome spike (top-left family). */
  function stud(rx, ry, h, w, open) {
    var dome = "M" + P(-w, -ry * 0.2) + "C" + P(-w, -h * 0.45) + " " + P(-w * 0.15, -h * 0.6) + " 0 " + f(-h) +
      "C" + P(w * 0.15, -h * 0.6) + " " + P(w, -h * 0.45) + " " + P(w, -ry * 0.2) + "Z";
    return '<ellipse class="g-fill" rx="' + f(rx) + '" ry="' + f(ry) + '"/>' +
      (open ? '<ellipse class="g-thin" rx="' + f(rx * 0.66) + '" ry="' + f(ry * 0.55) + '"/>' : "") +
      '<path class="g-fill" d="' + dome + '"/><path class="g-thin" d="M0 ' + f(-h * 0.92) + "V" + f(-ry * 0.25) + '"/>';
  }
  /* Bracelet chain with a clasp (left, beside the bands). */
  function claspChain(pts, L) {
    var s = samplePath(function (t) {
      var u = 1 - t, a = pts[0], c = pts[1], b = pts[2];
      return { x: u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], y: u * u * a[1] + 2 * u * t * c[1] + t * t * b[1] };
    }, L * 0.8);
    return linksAlong(s, L, "open") + '<circle class="g-fill" cx="' + f(pts[0][0]) + '" cy="' + f(pts[0][1] - L) + '" r="' + f(L * 0.7) + '"/>';
  }

  /* ------------------------------------------------------------------
   * Charms, crosses, pendants (right side of the sheet)
   * ------------------------------------------------------------------ */
  function heart(s, inner) {
    var d = "M0 " + f(0.95 * s) + "C" + P(-1.25 * s, 0.05 * s) + " " + P(-0.75 * s, -0.95 * s) + " 0 " + f(-0.35 * s) +
      "C" + P(0.75 * s, -0.95 * s) + " " + P(1.25 * s, 0.05 * s) + " 0 " + f(0.95 * s) + "Z";
    var inn = inner === "flip"
      ? '<path class="g-thin" transform="translate(0 ' + f(0.1 * s) + ') rotate(180) scale(.5)" d="' + d + '"/>'
      : '<path class="g-thin" transform="translate(0 ' + f(0.12 * s) + ') scale(.58)" d="' + d + '"/>';
    return '<path class="g-fill" d="' + d + '"/>' + inn;
  }
  function star6(s) {
    var p = [];
    for (var i = 0; i < 12; i++) { var r = i % 2 ? s * 0.58 : s, a = rad(-90 + 30 * i); p.push(P(r * Math.cos(a), r * Math.sin(a))); }
    return '<path class="g-fill" d="M' + p.join("L") + 'Z"/><path class="g-thin" d="M' + P(0, -s) + "L" + P(0, s) + "M" + P(-s * 0.87, -s / 2) + "L" + P(s * 0.87, s / 2) + "M" + P(-s * 0.87, s / 2) + "L" + P(s * 0.87, -s / 2) + '"/>';
  }
  function pinwheel(s) {
    var out = "";
    for (var i = 0; i < 5; i++) {
      var a = rad(-90 + i * 72), b = rad(-90 + i * 72 + 52);
      out += '<path class="g-fill" d="M0 0L' + P(s * Math.cos(a), s * Math.sin(a)) + "Q" + P(s * 0.95 * Math.cos(b - 0.5), s * 0.95 * Math.sin(b - 0.5)) + " " + P(s * 0.5 * Math.cos(b), s * 0.5 * Math.sin(b)) + 'Z"/>';
    }
    return out + '<circle class="g-thin" r="' + f(s * 0.18) + '"/>';
  }
  function pretzel(s) {
    return '<path class="g-fill" d="M' + P(-s, 0.1 * s) + "C" + P(-s, -0.9 * s) + " " + P(0.1 * s, -0.7 * s) + " " + P(0.15 * s, 0) +
      "C" + P(0.2 * s, 0.7 * s) + " " + P(s, 0.6 * s) + " " + P(s, -0.1 * s) + "C" + P(s, -0.7 * s) + " " + P(0.2 * s, -0.6 * s) + " " + P(-0.1 * s, 0.1 * s) +
      "C" + P(-0.3 * s, 0.7 * s) + " " + P(-s, 0.8 * s) + " " + P(-s, 0.1 * s) + 'Z"/>' +
      '<ellipse class="g-thin" cx="' + f(-0.45 * s) + '" cy="' + f(-0.05 * s) + '" rx="' + f(0.25 * s) + '" ry="' + f(0.2 * s) + '"/>' +
      '<ellipse class="g-thin" cx="' + f(0.55 * s) + '" cy="' + f(0.05 * s) + '" rx="' + f(0.22 * s) + '" ry="' + f(0.18 * s) + '"/>';
  }
  function bow(s) {
    return '<path class="g-fill" d="M0 0C' + P(-0.4 * s, -0.9 * s) + " " + P(-1.1 * s, -0.7 * s) + " " + P(-0.9 * s, -0.1 * s) +
      "C" + P(-1.1 * s, 0.6 * s) + " " + P(-0.3 * s, 0.8 * s) + " 0 0C" + P(0.3 * s, 0.8 * s) + " " + P(1.1 * s, 0.6 * s) + " " + P(0.9 * s, -0.1 * s) +
      "C" + P(1.1 * s, -0.7 * s) + " " + P(0.4 * s, -0.9 * s) + ' 0 0Z"/><circle class="g-fill" r="' + f(0.18 * s) + '"/>';
  }
  function ringHeart(s) { return '<circle class="g-fill" r="' + f(s) + '"/>' + g(0, 0.05 * s, 0, heart(s * 0.55)); }
  function fig8(s) {
    return '<circle class="g-fill" cy="' + f(-0.42 * s) + '" r="' + f(0.55 * s) + '"/><circle class="g-thin" cy="' + f(-0.42 * s) + '" r="' + f(0.3 * s) + '"/>' +
      '<circle class="g-fill" cy="' + f(0.45 * s) + '" r="' + f(0.6 * s) + '"/><circle class="g-thin" cy="' + f(0.45 * s) + '" r="' + f(0.34 * s) + '"/>';
  }
  /* Pointed, flared cross. up/down/side = arm lengths relative to s. */
  function cross(s, up, down, side) {
    var h = s * 0.15, pts = [];
    [[0, -1, up], [1, 0, side], [0, 1, down], [-1, 0, side]].forEach(function (a) {
      var dx = a[0], dy = a[1], l = a[2] * s, qx = dy, qy = -dx;
      var p = function (q, d) { pts.push([qx * q + dx * d, qy * q + dy * d]); };
      p(h, h); p(h, l - 0.36 * s); p(0.3 * s, l - 0.14 * s); p(0, l); p(-0.3 * s, l - 0.14 * s); p(-h, l - 0.36 * s);
    });
    var d = "M" + pts.map(function (q) { return P(q[0], q[1]); }).join("L") + "Z";
    var facets = "";
    [[0, -1, up], [1, 0, side], [0, 1, down], [-1, 0, side]].forEach(function (a) {
      var l = a[2] * s;
      facets += "M" + P(a[0] * (l - 0.14 * s) + a[1] * 0.3 * s, a[1] * (l - 0.14 * s) - a[0] * 0.3 * s) + "L" + P(a[0] * (l - 0.22 * s), a[1] * (l - 0.22 * s)) +
        "L" + P(a[0] * (l - 0.14 * s) - a[1] * 0.3 * s, a[1] * (l - 0.14 * s) + a[0] * 0.3 * s);
    });
    return '<path class="g-fill" d="' + d + '"/><path class="g-thin" d="' + facets + '"/>';
  }
  function charm(type, s) {
    switch (type) {
      case "star": return star6(s);
      case "pinwheel": return pinwheel(s);
      case "pretzel": return pretzel(s);
      case "heart": return heart(s);
      case "heartFlip": return heart(s, "flip");
      case "bow": return bow(s);
      case "ringHeart": return ringHeart(s);
      case "fig8": return fig8(s);
      case "cross1": return cross(s, 0.9, 0.9, 0.9);
      case "cross2": return cross(s, 0.8, 1.15, 0.78);
      case "cross3": return cross(s, 0.72, 1.35, 0.68);
      default: return heart(s);
    }
  }
  /* Λ pendant: charm at the apex, two chains falling away from it. */
  function pendant(s, type, spread, len) {
    var out = "", L = s * 0.32, sp = rad(spread || 30), ln = len || s * 3;
    [-1, 1].forEach(function (k) {
      var pts = samplePath(function (t) {
        return { x: k * Math.sin(sp) * (s * 0.6 + ln * t), y: s * 0.7 + Math.cos(sp) * ln * t };
      }, L * 0.8);
      out += linksAlong(pts, L, "open");
    });
    return out + charm(type, s);
  }
  /* Arched necklace with a charm at the top (third pendant). */
  function arch(w, h, s) {
    var pts = samplePath(function (t) {
      var a = Math.PI * (1 - t);
      return { x: w * Math.cos(a), y: h * (1 - Math.sin(a)) };
    }, s * 0.42), out = "";
    pts.forEach(function (p, i) { out += i % 3 === 1 ? bead(p.x, p.y, s * 0.2) : tlink(p.x, p.y, 0, s * 0.42, true); });
    return out + '<circle class="g-fill" r="' + f(s * 0.45) + '"/><circle class="g-thin" r="' + f(s * 0.22) + '"/>';
  }

  /* Bracket line used as a family head where the drawing has no circle. */
  function bracket(h, open) {
    var k = open === "left" ? -1 : 1, t = 6 * k;
    return '<path class="g-bracket" d="M' + P(t, -h) + "H0V" + f(h) + "H" + f(t) + '"/>';
  }

  /* ------------------------------------------------------------------ */
  function render(gl) {
    switch (gl.type) {
      case "chainSeg": return chain(gl.pts.map(function (p) { return { x: p[0], y: p[1] }; }), gl.R, null);
      case "chainArc": return chain(arcPoints(gl.cx || 0, gl.cy || 0, gl.rad, gl.a0, gl.a1, gl.n), gl.R, null);
      case "link": return chainLink(0, 0, gl.ang || 0, gl.R);
      case "loop": return loop(gl.rx, gl.ry, gl.L, gl.kind, gl.wobble);
      case "spiral": return spiral(gl.r, gl.L);
      case "arcLinks": return arcLinks(gl.rad, gl.a0, gl.a1, gl.L, gl.kind, gl.cx, gl.cy);
      case "segment": return segment(gl.p[0], gl.p[1], gl.p[2], gl.p[3], gl.L, gl.kind, gl.bend);
      case "barbed": return barbed(gl.r, gl.a0, gl.a1, gl.L);
      case "nubRing": return nubRing(gl.r, gl.n);
      case "spurCuff": return spurCuff(gl.r);
      case "band": return band(gl.rx, gl.ry, gl.gapAt, gl.gap);
      case "lens": return g(0, 0, gl.ang || 0, lens(gl.rx, gl.ry));
      case "stud": return g(0, 0, gl.ang || 0, stud(gl.rx, gl.ry, gl.h, gl.w, gl.open));
      case "clasp": return claspChain(gl.pts, gl.L);
      case "charm": return charm(gl.charm, gl.s);
      case "pendant": return pendant(gl.s, gl.charm, gl.spread, gl.len);
      case "arch": return arch(gl.w, gl.h, gl.s);
      case "bracket": return bracket(gl.h, gl.open);
      case "ring": return '<circle class="g-fill" r="' + f(gl.r) + '"/><circle class="g-thin" r="' + f(gl.r * 0.7) + '"/>';
      case "group": return gl.items.map(function (it) { return g(it.x || 0, it.y || 0, 0, render(it)); }).join("");
      default: return "";
    }
  }

  /* Separate parts of one link, for the exploded "anatomy" study. */
  function linkParts(R) {
    var t = function (a, b) { return P(a * R, b * R); };
    return {
      body: '<path class="g-link" fill-rule="evenodd" d="' + linkOutline(R) + linkHole(R) + '"/><path class="g-ink" d="' + linkOutline(R) + linkHole(R) + '"/>',
      top: '<path class="fa" d="M' + t(0, -1.3) + "L" + t(0, -0.27) + "L" + t(-0.6, -0.86) + 'Z"/><path class="fb" d="M' + t(0, -1.3) + "L" + t(0, -0.27) + "L" + t(0.6, -0.86) + 'Z"/>' +
        '<path class="g-thin" d="M' + t(0, -1.3) + "L" + t(-0.6, -0.86) + "L" + t(0, -0.27) + "L" + t(0.6, -0.86) + 'Z"/>',
      bottom: '<path class="fb" d="M' + t(0, 1.3) + "L" + t(0, 0.27) + "L" + t(-0.6, 0.86) + 'Z"/><path class="fa" d="M' + t(0, 1.3) + "L" + t(0, 0.27) + "L" + t(0.6, 0.86) + 'Z"/>' +
        '<path class="g-thin" d="M' + t(0, 1.3) + "L" + t(-0.6, 0.86) + "L" + t(0, 0.27) + "L" + t(0.6, 0.86) + 'Z"/>'
    };
  }

  window.VasiliGlyphs = { render: render, chain: chain, chainLink: chainLink, connector: connector, arcPoints: arcPoints, linkParts: linkParts };
})();
