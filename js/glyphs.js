/*
 * Vector redraws of the shapes in the client's drawings (references/).
 * Each function returns an SVG markup string drawn around (0,0) unless
 * coordinates are passed. Styling comes from CSS classes:
 *   .g-fill  shape filled with the background colour (hides lines behind)
 *   .g-thin  hairline detail
 *   .spk-a / .spk-b  the two shaded faces of a spike
 */
(function () {
  "use strict";
  var f = function (n) { return Math.round(n * 100) / 100; };
  var rad = function (deg) { return deg * Math.PI / 180; };

  /* Small thorn link from the chain studies (01, 07, 08). Axis along x. */
  function tlink(x, y, ang, L, open) {
    var rx = L * 0.5, ry = L * 0.34, t = L * 0.56, w = L * 0.1;
    var inner = open
      ? '<ellipse class="g-thin" rx="' + f(rx * 0.62) + '" ry="' + f(ry * 0.5) + '"/>'
      : '<path class="g-thin" d="M' + f(-rx * 0.4) + ' ' + f(-ry * 0.4) + 'L' + f(rx * 0.4) + ' ' + f(ry * 0.4) +
        'M' + f(-rx * 0.4) + ' ' + f(ry * 0.4) + 'L' + f(rx * 0.4) + ' ' + f(-ry * 0.4) + '"/>';
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">' +
      '<path class="g-fill" d="M' + f(-w) + ' ' + f(-ry + 0.6) + 'L0 ' + f(-t) + 'L' + f(w) + ' ' + f(-ry + 0.6) +
      'M' + f(-w) + ' ' + f(ry - 0.6) + 'L0 ' + f(t) + 'L' + f(w) + ' ' + f(ry - 0.6) + '"/>' +
      '<ellipse class="g-fill" rx="' + f(rx) + '" ry="' + f(ry) + '"/>' + inner + '</g>';
  }

  /* Large chain link from the main sheet: round link with pointed lobes. */
  function bigLink(x, y, ang, R) {
    var lens = function (k) {
      var r = R * k;
      return 'M0 ' + f(-1.5 * r) +
        'C' + f(0.55 * r) + ' ' + f(-1.15 * r) + ' ' + f(1.15 * r) + ' ' + f(-0.9 * r) + ' ' + f(1.05 * r) + ' 0' +
        'C' + f(1.15 * r) + ' ' + f(0.9 * r) + ' ' + f(0.55 * r) + ' ' + f(1.15 * r) + ' 0 ' + f(1.5 * r) +
        'C' + f(-0.55 * r) + ' ' + f(1.15 * r) + ' ' + f(-1.15 * r) + ' ' + f(0.9 * r) + ' ' + f(-1.05 * r) + ' 0' +
        'C' + f(-1.15 * r) + ' ' + f(-0.9 * r) + ' ' + f(-0.55 * r) + ' ' + f(-1.15 * r) + ' 0 ' + f(-1.5 * r) + 'Z';
    };
    var h = R * 0.56;
    var hole = 'M' + f(h) + ' 0A' + f(h) + ' ' + f(h) + ' 0 1 0 ' + f(-h) + ' 0A' + f(h) + ' ' + f(h) + ' 0 1 0 ' + f(h) + ' 0Z';
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')">' +
      '<path class="g-link" fill-rule="evenodd" d="' + lens(1) + hole + '"/>' +
      '<path class="g-thin" d="' + lens(0.8) + '"/>' +
      '<path class="g-thin" d="M0 ' + f(-h) + 'V' + f(-1.18 * R) + 'M0 ' + f(h) + 'V' + f(1.18 * R) + '"/>' +
      '</g>';
  }

  /* Double-pointed spike between two points, shaded on one face. */
  function spike(x1, y1, x2, y2, w) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len * w, ny = dx / len * w;
    var a = f(x1) + ' ' + f(y1), b = f(x2) + ' ' + f(y2);
    return '<path class="spk-a" d="M' + a + 'L' + f(mx + nx) + ' ' + f(my + ny) + 'L' + b + 'Z"/>' +
      '<path class="spk-b" d="M' + a + 'L' + f(mx - nx) + ' ' + f(my - ny) + 'L' + b + 'Z"/>';
  }

  /* Alternating big links and spikes along a list of points. */
  function chainAlong(pts, R, endSpikes) {
    var out = "", i, ang;
    if (endSpikes) {
      var p0 = pts[0], p1 = pts[1], q0 = pts[pts.length - 1], q1 = pts[pts.length - 2];
      var e = R * 3.6;
      var u = norm(p0.x - p1.x, p0.y - p1.y), v = norm(q0.x - q1.x, q0.y - q1.y);
      out += spike(p0.x, p0.y, p0.x + u.x * e, p0.y + u.y * e, R * 0.42);
      out += spike(q0.x, q0.y, q0.x + v.x * e, q0.y + v.y * e, R * 0.42);
    }
    for (i = 0; i < pts.length - 1; i++) out += spike(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, R * 0.36);
    for (i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      out += bigLink(pts[i].x, pts[i].y, ang, R);
    }
    return out;
  }
  function norm(x, y) { var l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }

  function arcPoints(cx, cy, r, a0, a1, n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var t = rad(a0 + (a1 - a0) * (n === 1 ? 0.5 : i / (n - 1)));
      pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
    }
    return pts;
  }

  /* Thorn links placed along an arc (a0..a1 degrees). */
  function arcLinks(cx, cy, r, a0, a1, L, open) {
    var n = Math.max(2, Math.round(Math.abs(rad(a1 - a0)) * r / (L * 0.78)) + 1), out = "";
    for (var i = 0; i < n; i++) {
      var t = rad(a0 + (a1 - a0) * i / (n - 1));
      out += tlink(cx + r * Math.cos(t), cy + r * Math.sin(t), (t * 180 / Math.PI) + 90, L, open);
    }
    return out;
  }

  /* Closed bracelet loop of thorn links around an ellipse. */
  function loop(rx, ry, L, open) {
    var per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    var n = Math.max(6, Math.round(per / (L * 0.8))), out = "";
    for (var i = 0; i < n; i++) {
      var t = i / n * Math.PI * 2;
      var ang = Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180 / Math.PI;
      out += tlink(rx * Math.cos(t), ry * Math.sin(t), ang, L, open);
    }
    return out;
  }

  /* Straight study strand (vertical). */
  function strand(len, L, open, wave) {
    var n = Math.round(len / (L * 0.82)), out = "";
    for (var i = 0; i < n; i++) {
      var y = -len / 2 + len * i / (n - 1);
      var x = wave ? Math.sin(i / n * Math.PI * 3) * wave : 0;
      out += tlink(x, y, 90 + (wave ? Math.cos(i / n * Math.PI * 3) * 14 : 0), L, open);
    }
    return out;
  }

  /* Open cuff ring with a spur at one end. */
  function cuff(r, gapDeg) {
    var g = gapDeg || 70, a0 = rad(90 + g / 2), a1 = rad(90 - g / 2 + 360), ri = r * 0.76;
    var P = function (rr, a) { return f(rr * Math.cos(a)) + ' ' + f(rr * Math.sin(a)); };
    var d = 'M' + P(r, a0) + 'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + P(r, a1) + 'L' + P(ri, a1) +
      'A' + f(ri) + ' ' + f(ri) + ' 0 1 0 ' + P(ri, a0) + 'Z';
    var tip = a1 + rad(16), mid = (r + ri) / 2;
    var spur = 'M' + P(r, a1) + 'L' + P(mid * 1.02, tip) + 'L' + P(ri, a1) + 'Z';
    return '<path class="g-fill" d="' + d + '"/><path class="g-fill" d="' + spur + '"/>' +
      '<path class="g-thin" d="M' + P(mid, a0 + 0.2) + 'A' + f(mid) + ' ' + f(mid) + ' 0 1 1 ' + P(mid, a1 - 0.2) + '"/>';
  }

  /* Ring with outward spurs. */
  function spikedRing(r, n) {
    var out = "", w = Math.max(2.4, r * 0.16);
    for (var i = 0; i < n; i++) {
      var a = rad(-90 + 360 * i / n), c = Math.cos(a), s = Math.sin(a);
      out += '<path class="g-fill" d="M' + f(r * c - w * s) + ' ' + f(r * s + w * c) + 'L' + f(r * 1.32 * c) + ' ' + f(r * 1.32 * s) +
        'L' + f(r * c + w * s) + ' ' + f(r * s - w * c) + 'Z"/>';
    }
    return out + '<circle class="g-fill" r="' + f(r) + '"/><circle class="g-thin" r="' + f(r * 0.8) + '"/>';
  }

  function hoop(rx, ry) {
    return '<ellipse class="g-fill" rx="' + f(rx) + '" ry="' + f(ry) + '"/>' +
      '<ellipse class="g-thin" rx="' + f(rx * 0.62) + '" ry="' + f(ry * 0.82) + '"/>' +
      '<path class="g-fill" d="M-3 ' + f(-ry + 1) + 'L0 ' + f(-ry - 8) + 'L3 ' + f(-ry + 1) + 'Z"/>';
  }

  /* Open C shape (ear cuff) — flip mirrors it. */
  function cshape(r, flip) {
    var s = flip ? -1 : 1, ri = r * 0.8;
    var P = function (rr, a) { return f(s * rr * Math.cos(a)) + ' ' + f(rr * Math.sin(a)); };
    var a0 = rad(-50), a1 = rad(50);
    var sw = flip ? 0 : 1;
    return '<path class="g-fill" d="M' + P(r, a0) + 'A' + f(r) + ' ' + f(r) + ' 0 1 ' + (1 - sw) + ' ' + P(r, a1) +
      'L' + P(ri, a1) + 'A' + f(ri) + ' ' + f(ri) + ' 0 1 ' + sw + ' ' + P(ri, a0) + 'Z"/>';
  }

  function stud(r) {
    return '<path class="g-fill" d="M' + f(r * 0.7) + ' ' + f(-r * 0.45) + 'L' + f(r * 1.9) + ' 0L' + f(r * 0.7) + ' ' + f(r * 0.45) + 'Z"/>' +
      '<circle class="g-fill" r="' + f(r) + '"/><circle class="g-thin" r="' + f(r * 0.55) + '"/>';
  }

  /* Pointed cross. up/down/side are arm lengths relative to s. */
  function cross(s, up, down, side) {
    var w = s * 0.24, h = w / 2, pts = [];
    var arms = [[0, -1, up], [1, 0, side], [0, 1, down], [-1, 0, side]];
    arms.forEach(function (a) {
      var dx = a[0], dy = a[1], l = a[2] * s, qx = dy, qy = -dx;
      pts.push([qx * h + dx * h, qy * h + dy * h]);
      pts.push([qx * h + dx * (l - 0.3 * s), qy * h + dy * (l - 0.3 * s)]);
      pts.push([qx * 0.22 * s + dx * (l - 0.2 * s), qy * 0.22 * s + dy * (l - 0.2 * s)]);
      pts.push([dx * l, dy * l]);
      pts.push([-qx * 0.22 * s + dx * (l - 0.2 * s), -qy * 0.22 * s + dy * (l - 0.2 * s)]);
      pts.push([-qx * h + dx * (l - 0.3 * s), -qy * h + dy * (l - 0.3 * s)]);
    });
    var d = 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z';
    var k = s * 0.13;
    return '<path class="g-fill" d="' + d + '"/><path class="g-thin" d="M0 ' + f(-k) + 'L' + f(k) + ' 0L0 ' + f(k) + 'L' + f(-k) + ' 0Z"/>';
  }

  function heart(s) {
    var d = 'M0 ' + f(0.95 * s) + 'C' + f(-1.25 * s) + ' ' + f(0.05 * s) + ' ' + f(-0.75 * s) + ' ' + f(-0.95 * s) + ' 0 ' + f(-0.35 * s) +
      'C' + f(0.75 * s) + ' ' + f(-0.95 * s) + ' ' + f(1.25 * s) + ' ' + f(0.05 * s) + ' 0 ' + f(0.95 * s) + 'Z';
    return '<path class="g-fill" d="' + d + '"/><path class="g-thin" transform="scale(.66) translate(0 ' + f(s * 0.1) + ')" d="' + d + '"/>';
  }
  function spade(s) {
    return '<g transform="rotate(180)">' + heart(s) + '</g>' +
      '<path class="g-fill" d="M0 ' + f(0.6 * s) + 'L' + f(0.3 * s) + ' ' + f(1.2 * s) + 'L' + f(-0.3 * s) + ' ' + f(1.2 * s) + 'Z"/>';
  }
  function star(s, n) {
    var pts = [], k = n || 6;
    for (var i = 0; i < k * 2; i++) {
      var r = i % 2 ? s * 0.55 : s, a = rad(-90 + 180 * i / k);
      pts.push(f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a)));
    }
    return '<path class="g-fill" d="M' + pts.join('L') + 'Z"/><circle class="g-thin" r="' + f(s * 0.28) + '"/>';
  }
  function flower(s) {
    var pts = [];
    for (var i = 0; i <= 80; i++) {
      var t = i / 80 * Math.PI * 2, r = s * (0.62 + 0.38 * Math.cos(5 * t));
      pts.push(f(r * Math.cos(t - Math.PI / 2)) + ' ' + f(r * Math.sin(t - Math.PI / 2)));
    }
    return '<path class="g-fill" d="M' + pts.join('L') + 'Z"/><circle class="g-thin" r="' + f(s * 0.2) + '"/>';
  }
  function knot(s) {
    return '<circle class="g-fill" cx="' + f(-s * 0.32) + '" r="' + f(s * 0.62) + '"/>' +
      '<circle class="g-thin" cx="' + f(-s * 0.32) + '" r="' + f(s * 0.4) + '"/>' +
      '<circle class="g-fill" cx="' + f(s * 0.32) + '" r="' + f(s * 0.62) + '"/>' +
      '<circle class="g-thin" cx="' + f(s * 0.32) + '" r="' + f(s * 0.4) + '"/>' +
      '<path class="g-fill" d="M' + f(s * 0.9) + ' ' + f(-s * 0.2) + 'L' + f(s * 1.3) + ' 0L' + f(s * 0.9) + ' ' + f(s * 0.2) + 'Z"/>';
  }
  function charm(type, s) {
    return ({ heart: heart, spade: spade, star: star, flower: flower, knot: knot,
      cross: function (k) { return cross(k, 0.8, 1.15, 0.72); } }[type] || heart)(s);
  }

  /* V-shaped necklace ending in a charm. */
  function pendant(s, type) {
    var out = "", n = 9;
    [-1, 1].forEach(function (side) {
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1);
        out += '<ellipse class="g-thin" cx="' + f(side * s * (1 - t)) + '" cy="' + f(-s * 1.1 * (1 - t)) +
          '" rx="' + f(s * 0.07) + '" ry="' + f(s * 0.045) + '" transform="rotate(' + f(side * -48) + ' ' +
          f(side * s * (1 - t)) + ' ' + f(-s * 1.1 * (1 - t)) + ')"/>';
      }
    });
    return out + '<g transform="translate(0 ' + f(s * 0.42) + ')">' + charm(type, s * 0.36) + '</g>';
  }

  /* Curved chain ending in a clasp. */
  function claspChain(r) {
    var out = arcLinks(0, r * 0.7, r, 200, 340, r * 0.16, true);
    var t = rad(340), x = r * Math.cos(t), y = r * 0.7 + r * Math.sin(t);
    return out + '<circle class="g-fill" cx="' + f(x + 8) + '" cy="' + f(y + 8) + '" r="' + f(r * 0.1) + '"/>';
  }

  /* Barbed crescent (circled component in the lower-left family). */
  function barbed(r) {
    var out = arcLinks(0, 0, r, 110, 330, r * 0.3, false), i;
    for (i = 0; i < 7; i++) {
      var a = rad(125 + i * 30), c = Math.cos(a), s = Math.sin(a), rr = r * 1.22;
      out += '<path class="g-fill" d="M' + f(r * 1.05 * c - 3 * s) + ' ' + f(r * 1.05 * s + 3 * c) + 'L' + f(rr * c) + ' ' + f(rr * s) +
        'L' + f(r * 1.05 * c + 3 * s) + ' ' + f(r * 1.05 * s - 3 * c) + 'Z"/>';
    }
    return out;
  }

  /* Two thorn links joined by a bar (chain-study component). */
  function pair(L) {
    return '<path class="g-thin" d="M' + f(-L * 0.45) + ' 0H' + f(L * 0.45) + '"/>' +
      tlink(-L * 0.75, 0, 90, L) + tlink(L * 0.75, 0, 90, L);
  }

  /* Render a glyph spec from data/origin-map.js. */
  function render(g) {
    switch (g.type) {
      case "arcChain": return chainAlong(arcPoints(g.cx || 0, g.cy || 0, g.rad, g.a0, g.a1, g.n), g.R, false);
      case "arcLinks": return arcLinks(g.cx || 0, g.cy || 0, g.rad, g.a0, g.a1, g.L, g.open);
      case "loop": return loop(g.rx, g.ry, g.L, g.open);
      case "strand": return strand(g.len, g.L, g.open, g.wave);
      case "cuff": return cuff(g.r, g.gap);
      case "spikedRing": return spikedRing(g.r, g.n);
      case "hoop": return hoop(g.rx, g.ry);
      case "cshape": return cshape(g.r, g.flip);
      case "stud": return stud(g.r);
      case "cross": return cross(g.s, g.up || 0.8, g.down || 1.15, g.side || 0.72);
      case "charm": return charm(g.charm, g.s);
      case "pendant": return pendant(g.s, g.charm);
      case "claspChain": return claspChain(g.r);
      case "barbed": return barbed(g.r);
      case "pair": return pair(g.L);
      default: return "";
    }
  }

  window.VasiliGlyphs = {
    render: render, tlink: tlink, bigLink: bigLink, spike: spike,
    chainAlong: chainAlong, arcPoints: arcPoints
  };
})();
