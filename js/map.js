/*
 * Origin map — an interactive redraw of the client's main sheet.
 * Not linked from navigation: visitors arrive from a product description
 * ("See origin") or an FAQ answer.
 *
 * URL state (query strings work on GitHub Pages without rewrites, survive
 * refresh, and give normal Back/Forward):
 *   map.html?node=d1                 node panel open, camera on that form
 *   map.html?node=d1-2&piece=piece-a piece detail open (product "See origin")
 *   map.html?node=d1&view=study      hidden close study of a drawn form
 */
(function () {
  "use strict";
  var S = window.VasiliSite, G = window.VasiliGlyphs, M = S.map;
  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CONN = window.VASILI_CONNECTIONS || [];

  var stage = document.getElementById("stage");
  var svg = document.getElementById("map");
  var panel = document.getElementById("panel");
  var panelContent = document.getElementById("panel-content");
  var trailEl = document.getElementById("trail");
  var hint = document.getElementById("hint");
  var study = document.getElementById("study");

  /* ---------- graph ---------- */
  var nodes = { chain: { id: "chain", parent: null, depth: 0 } }, children = { chain: [] };
  M.nodes.forEach(function (n) { nodes[n.id] = n; children[n.id] = []; });
  M.nodes.forEach(function (n) { children[n.parent].push(n.id); });
  M.nodes.forEach(function (n) { var d = 0, p = n; while (p.id !== "chain") { d++; p = nodes[p.parent]; } n.depth = d; });
  function ancestry(id) { var out = [], p = nodes[id]; while (p) { out.unshift(p.id); p = p.parent ? nodes[p.parent] : null; } return out; }
  function family(id) { var a = ancestry(id); return a[1] || null; }
  function descendants(id) { var out = []; (children[id] || []).forEach(function (c) { out.push(c); out = out.concat(descendants(c)); }); return out; }
  var linkPts = M.chain.links.map(function (p) { return { x: p[0], y: p[1] }; });
  var CHAIN_CENTER = { x: 510, y: 430 };

  /* ---------- discovery memory (per visitor, optional) ---------- */
  var found = {};
  try { (JSON.parse(localStorage.getItem("vasili-found") || "[]")).forEach(function (id) { found[id] = true; }); } catch (e) { /* storage blocked */ }
  function remember(id) {
    if (!id || found[id]) return;
    found[id] = true;
    try { localStorage.setItem("vasili-found", JSON.stringify(Object.keys(found))); } catch (e) { /* ignore */ }
  }

  /* ---------- render ---------- */
  function el(tag, attrs, html) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html;
    return e;
  }
  function href(p) {
    var q = new URLSearchParams();
    ["node", "piece", "from", "view"].forEach(function (k) { if (p[k]) q.set(k, p[k]); });
    var s = q.toString();
    return s ? "?" + s : "map.html";
  }
  function layer(id) { return document.getElementById(id); }

  function renderChain() {
    var a = el("a", { href: href({ node: "chain" }), class: "chain-node", "data-node": "chain", "aria-label": "The chain, " + S.code("chain") });
    a.appendChild(el("path", { class: "hitline", d: "M" + M.chain.tips[0].x + " " + M.chain.tips[0].y + "L" + linkPts.map(function (p) { return p.x + " " + p.y; }).join("L") + "L" + M.chain.tips[1].x + " " + M.chain.tips[1].y }));
    a.appendChild(el("g", { class: "chain-art" }, G.chain(linkPts, M.chain.R, M.chain.tips)));
    layer("chain-layer").appendChild(a);
  }

  function renderLines() {
    var L = layer("line-layer");
    M.nodes.forEach(function (n) {
      if (n.line) L.appendChild(el("path", { class: "ln", d: n.line, id: "ln-" + n.id, pathLength: 1, style: "--d:" + n.depth }));
      if (n.decor) L.appendChild(el("path", { class: "ln ln-decor", d: n.decor, id: "dc-" + n.id, pathLength: 1, style: "--d:" + n.depth }));
      if (n.anchor != null) {
        // navigation trace from the chain to the family (not part of the drawing)
        var p = linkPts[n.anchor], dx = n.x - p.x, dy = n.y - p.y, l = Math.hypot(dx, dy);
        var sx = p.x + dx / l * M.chain.R * 1.3, sy = p.y + dy / l * M.chain.R * 1.3;
        var ex = n.x - dx / l * (n.circled ? n.r : 4), ey = n.y - dy / l * (n.circled ? n.r : 4);
        layer("trace-layer").appendChild(el("path", { class: "trace", id: "tr-" + n.id, pathLength: 1, d: "M" + sx + " " + sy + "L" + ex + " " + ey }));
      }
    });
    CONN.forEach(function (c) {
      var n = nodes[c.node];
      if (!n) return;
      var r = 22, dx = c.at[0] - n.x, dy = c.at[1] - n.y, l = Math.hypot(dx, dy);
      layer("trace-layer").appendChild(el("path", {
        class: "ln-piece" + (c.confirmed ? " is-confirmed" : ""), id: "lp-" + c.product, pathLength: 1,
        d: "M" + (n.x + dx / l * n.r) + " " + (n.y + dy / l * n.r) + "L" + (c.at[0] - dx / l * (r + 3)) + " " + (c.at[1] - dy / l * (r + 3))
      }));
    });
  }

  function renderNodes() {
    var L = layer("node-layer");
    M.nodes.forEach(function (n) {
      var kids = children[n.id].length;
      var a = el("a", { href: href({ node: n.id }), class: "node" + (n.depth === 1 ? " node--head" : "") + (n.circled ? " node--circled" : "") + (n.glyph.type === "bracket" ? " node--bracket" : ""), "data-node": n.id,
        style: "--d:" + n.depth, "aria-label": "Form " + S.code(n.id) + (kids ? ", " + kids + (kids === 1 ? " branch" : " branches") : "") });
      a.appendChild(el("circle", { class: "halo", cx: n.x, cy: n.y, r: n.r * 1.45 }));
      if (n.glyph.type === "bracket") {
        a.appendChild(el("path", { class: "hitline", d: "M" + n.x + " " + (n.y - n.glyph.h) + "V" + (n.y + n.glyph.h) }));
      }
      a.appendChild(el("circle", { class: "hit", cx: n.x, cy: n.y, r: n.r }));
      if (n.circled) a.appendChild(el("circle", { class: "ring", cx: n.x, cy: n.y, r: n.r }));
      a.appendChild(el("g", { class: "art", transform: "translate(" + n.x + " " + n.y + ")" }, G.render(n.glyph)));
      if (CONN.some(function (c) { return c.node === n.id; })) {
        a.appendChild(el("circle", { class: "glint", cx: n.x + n.r * 0.72, cy: n.y - n.r * 0.72, r: 1.6 }));
      }
      // label sits on the upper-right diagonal, clear of the drawing's horizontal/vertical lines
      a.appendChild(el("text", { class: "nlabel", x: n.x + n.r * 0.78 + 1.5, y: n.y - n.r * 0.78 - 1.5, "aria-hidden": "true" }, S.code(n.id)));
      L.appendChild(a);
    });
  }

  function renderPieces() {
    var L = layer("piece-layer"), defs = el("defs", {});
    L.appendChild(defs);
    CONN.forEach(function (c) {
      var p = S.product(c.product);
      if (!p || !nodes[c.node]) return;
      var r = 22, x = c.at[0], y = c.at[1];
      defs.appendChild(el("clipPath", { id: "clip-" + p.id }, '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>'));
      var a = el("a", { href: href({ node: c.node, piece: p.id }), class: "piece", "data-piece": p.id, "data-node": c.node,
        "aria-label": "Piece " + p.code + ", from form " + S.code(c.node) + (c.confirmed ? "" : " (connection to confirm)") });
      a.appendChild(el("circle", { class: "p-ring2", cx: x, cy: y, r: r + 3 }));
      a.appendChild(el("circle", { cx: x, cy: y, r: r, fill: "#eef1f4", stroke: "none" }));
      a.appendChild(el("image", { href: S.src(p.photos[0].base, 480), x: x - r, y: y - r, width: r * 2, height: r * 2,
        preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#clip-" + p.id + ")" }));
      a.appendChild(el("circle", { class: "p-ring", cx: x, cy: y, r: r }));
      a.appendChild(el("text", { class: "nlabel nlabel--piece", x: x, y: y + r + 9, "aria-hidden": "true" }, p.code));
      L.appendChild(a);
    });
  }

  /* ---------- camera (sheet units) ---------- */
  var B = M.bounds, TOOLBAR = 84;
  var cam = { cx: B.x + B.w / 2, cy: B.y + B.h / 2, s: 1 }, anim = null;
  function size() { var r = stage.getBoundingClientRect(); return { w: r.width || 1, h: r.height || 1 }; }
  function fitScale() { var z = size(); return Math.max(B.w / (z.w * 0.96), B.h / Math.max(120, z.h - TOOLBAR - 30)); }
  function limits() { var f = fitScale(); return { min: 0.09, max: f * 1.6 }; }
  function apply() {
    var z = size();
    svg.setAttribute("viewBox", [cam.cx - z.w * cam.s / 2, cam.cy - z.h * cam.s / 2, z.w * cam.s, z.h * cam.s].join(" "));
    svg.style.setProperty("--u", cam.s); // 1 screen px in sheet units: keeps labels a constant size
  }
  function clampCam(c) {
    var l = limits(), z = size();
    c.s = Math.min(l.max, Math.max(l.min, c.s));
    var hx = z.w * c.s / 2, hy = z.h * c.s / 2;
    c.cx = Math.min(B.x + B.w + hx - 60, Math.max(B.x - hx + 60, c.cx));
    c.cy = Math.min(B.y + B.h + hy - 60, Math.max(B.y - hy + 60, c.cy));
    return c;
  }
  function moveTo(t, instant) {
    clampCam(t);
    if (anim) cancelAnimationFrame(anim);
    if (instant || reduceMotion) { cam = t; apply(); return; }
    var from = { cx: cam.cx, cy: cam.cy, s: cam.s }, t0 = performance.now(), dur = 800;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam = { cx: from.cx + (t.cx - from.cx) * e, cy: from.cy + (t.cy - from.cy) * e, s: Math.exp(Math.log(from.s) + (Math.log(t.s) - Math.log(from.s)) * e) };
      apply();
      anim = k < 1 ? requestAnimationFrame(step) : null;
    })(t0);
  }
  function covers() {
    var z = size(), right = 0, bottom = 0;
    if (!panel.hidden) { var r = panel.getBoundingClientRect(); if (r.width < z.w * 0.95) right = r.width; else bottom = r.height; }
    return { right: right, bottom: bottom };
  }
  function focusBox(b, instant) {
    var z = size(), c = covers(), top = 56;
    var aw = z.w - c.right, ah = z.h - c.bottom - top - (c.bottom ? 8 : TOOLBAR);
    var s = Math.max(b.w / (aw * 0.82), b.h / (ah * 0.82), 0.22);
    var vcx = (aw) / 2, vcy = top + ah / 2; // centre of the visible area, in px
    moveTo({ cx: b.x + b.w / 2 + (z.w / 2 - vcx) * s, cy: b.y + b.h / 2 + (z.h / 2 - vcy) * s, s: s }, instant);
  }
  function overviewCam(instant) {
    var s = fitScale(), z = size(), cx = B.x + B.w / 2;
    if (z.w < 700 && z.h > z.w) { s = Math.min(s, B.h / Math.max(120, z.h - TOOLBAR - 30) * 0.85); cx = CHAIN_CENTER.x; }
    moveTo({ cx: cx, cy: B.y + B.h / 2 + (TOOLBAR / 2 - 20) * s, s: s }, instant);
  }
  function boxFor(id, pieceId) {
    if (id === "chain") return B;
    var n = nodes[id], pts = [[n.x, n.y, n.r]];
    children[id].forEach(function (c) { pts.push([nodes[c].x, nodes[c].y, nodes[c].r]); });
    if (n.parent !== "chain" && !pieceId) pts.push([nodes[n.parent].x, nodes[n.parent].y, nodes[n.parent].r * 0.5]);
    CONN.forEach(function (c) { if (c.node === id && (!pieceId || c.product === pieceId)) pts.push([c.at[0], c.at[1], 30]); });
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(function (q) { x0 = Math.min(x0, q[0] - q[2]); y0 = Math.min(y0, q[1] - q[2]); x1 = Math.max(x1, q[0] + q[2]); y1 = Math.max(y1, q[1] + q[2]); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* ---------- pointer / wheel / keyboard ---------- */
  var pointers = {}, drag = null, suppressClick = false;
  function local(e) { var r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function zoomAt(px, py, k) {
    var z = size(), l = limits(), wx = cam.cx + (px - z.w / 2) * cam.s, wy = cam.cy + (py - z.h / 2) * cam.s;
    var s = Math.min(l.max, Math.max(l.min, cam.s * k));
    cam = clampCam({ cx: wx - (px - z.w / 2) * s, cy: wy - (py - z.h / 2) * s, s: s });
    apply();
  }
  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    pointers[e.pointerId] = local(e);
    var ids = Object.keys(pointers);
    if (ids.length === 1) drag = { x: pointers[ids[0]].x, y: pointers[ids[0]].y, cx: cam.cx, cy: cam.cy, moved: false };
    if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; drag = { pinch: Math.hypot(a.x - b.x, a.y - b.y), s: cam.s, moved: true }; }
  });
  stage.addEventListener("pointermove", function (e) {
    if (!pointers[e.pointerId] || !drag) return;
    pointers[e.pointerId] = local(e);
    var ids = Object.keys(pointers);
    if (ids.length >= 2 && drag.pinch) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (drag.s * drag.pinch / Math.hypot(a.x - b.x, a.y - b.y)) / cam.s);
      return;
    }
    var p = pointers[e.pointerId], dx = p.x - drag.x, dy = p.y - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true; stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      dismissHint();
    }
    if (drag.moved && drag.cx != null) { cam = clampCam({ cx: drag.cx - dx * cam.s, cy: drag.cy - dy * cam.s, s: cam.s }); apply(); }
  });
  function endPointer(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    if (drag && drag.moved) { suppressClick = true; setTimeout(function () { suppressClick = false; }, 60); }
    var ids = Object.keys(pointers);
    if (!ids.length) { drag = null; stage.classList.remove("is-dragging"); }
    else if (drag && drag.pinch) drag = { x: pointers[ids[0]].x, y: pointers[ids[0]].y, cx: cam.cx, cy: cam.cy, moved: true };
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    var p = local(e), dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(p.x, p.y, Math.exp(dy * (e.ctrlKey ? 0.01 : 0.0018)));
    dismissHint();
  }, { passive: false });
  stage.addEventListener("click", function (e) { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);
  stage.addEventListener("keydown", function (e) {
    var z = size(), mv = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[e.key];
    if (mv) { e.preventDefault(); moveTo({ cx: cam.cx + mv[0] * cam.s, cy: cam.cy + mv[1] * cam.s, s: cam.s }, true); }
    else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomAt(z.w / 2, z.h / 2, 1 / 1.3); }
    else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoomAt(z.w / 2, z.h / 2, 1.3); }
  });
  document.getElementById("zoom-in").addEventListener("click", function () { var z = size(); zoomAt(z.w / 2, z.h / 2, 1 / 1.4); });
  document.getElementById("zoom-out").addEventListener("click", function () { var z = size(); zoomAt(z.w / 2, z.h / 2, 1.4); });
  document.getElementById("overview").addEventListener("click", function () { navigate({}); overviewCam(); });
  function dismissHint() { if (hint) hint.classList.add("is-gone"); }

  /* ---------- state + URL ---------- */
  var current = { node: null, piece: null, from: null, view: null };
  var lastNode = null;
  function readURL() {
    var q = new URLSearchParams(location.search);
    var st = { node: q.get("node"), piece: q.get("piece"), from: q.get("from"), view: q.get("view") };
    if (st.node && M.aliases && M.aliases[st.node] && !nodes[st.node]) st.node = M.aliases[st.node];
    if (st.piece && !S.product(st.piece)) st.piece = null;
    if (st.piece && (!st.node || !nodes[st.node])) { var c = S.connectionFor(st.piece); st.node = c ? c.node : null; }
    if (st.node && !nodes[st.node]) st.node = null;
    if (!st.node) { st.piece = null; st.view = null; }
    if (st.view !== "study") st.view = null;
    return st;
  }
  function navigate(st, opts) {
    opts = opts || {};
    history[opts.replace ? "replaceState" : "pushState"](opts.state || null, "", href(st));
    render(readURL(), { user: true });
  }
  window.addEventListener("popstate", function () { render(readURL(), { user: true, fromHistory: true }); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var h = a.getAttribute("href") || "";
    if (h.charAt(0) !== "?" && h !== "map.html") return;
    e.preventDefault();
    var dlg = a.closest("dialog"); if (dlg) dlg.close();
    dismissHint();
    var q = new URLSearchParams(h.charAt(0) === "?" ? h.slice(1) : "");
    var st = { node: q.get("node"), piece: q.get("piece"), from: q.get("from"), view: q.get("view") };
    // moving between studies replaces the entry, so Close/Back returns to the drawing
    if (st.view && current.view) navigate(st, { replace: true, state: history.state });
    else navigate(st, { state: st.view ? { study: true } : null });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || document.getElementById("index-dialog").open) return;
    if (current.view) { e.preventDefault(); closeStudy(); }
    else if (!panel.hidden) { e.preventDefault(); navigate({}); }
  });

  /* ---------- selection visuals ---------- */
  function updateClasses(st, prev) {
    var path = st.node ? ancestry(st.node) : [];
    var fam = st.node ? family(st.node) : null;
    var awake = { chain: true };
    children.chain.forEach(function (id) { awake[id] = true; });
    path.forEach(function (id) { awake[id] = true; children[id].forEach(function (c) { awake[c] = true; }); });
    Object.keys(found).forEach(function (id) { if (nodes[id]) { awake[id] = true; } });

    svg.classList.toggle("has-selection", !!st.node);
    svg.querySelectorAll(".node").forEach(function (a) {
      var id = a.getAttribute("data-node");
      a.classList.toggle("is-selected", id === st.node && !st.piece);
      a.classList.toggle("is-path", path.indexOf(id) !== -1);
      a.classList.toggle("is-near", !!st.node && (nodes[id].parent === st.node));
      a.classList.toggle("is-family", !!fam && family(id) === fam);
      a.classList.toggle("is-dormant", !awake[id]);
      a.classList.toggle("is-found", !!found[id]);
      a.setAttribute("tabindex", awake[id] ? "0" : "-1");
    });
    svg.querySelector(".chain-node").classList.toggle("is-selected", st.node === "chain");
    M.nodes.forEach(function (n) {
      var ln = document.getElementById("ln-" + n.id), dc = document.getElementById("dc-" + n.id), tr = document.getElementById("tr-" + n.id);
      var on = path.indexOf(n.id) !== -1 || (st.node && n.parent === st.node);
      if (ln) { ln.classList.toggle("is-path", on); ln.classList.toggle("is-family", !!fam && family(n.id) === fam); ln.classList.toggle("is-dormant", !awake[n.id]); }
      if (dc) dc.classList.toggle("is-path", path.indexOf(n.id) !== -1);
      if (tr) tr.classList.toggle("is-on", path.indexOf(n.id) !== -1);
    });
    svg.querySelectorAll(".piece").forEach(function (a) {
      var id = a.getAttribute("data-piece"), nid = a.getAttribute("data-node");
      var show = st.piece === id || (!!fam && family(nid) === fam) || st.node === "chain";
      a.classList.toggle("is-shown", show);
      a.classList.toggle("is-selected", id === st.piece || id === st.from);
      a.setAttribute("tabindex", show ? "0" : "-1");
      var lp = document.getElementById("lp-" + id);
      if (lp) lp.classList.toggle("is-shown", show);
    });
    // replay the reveal on the newly opened branch
    if (st.node && st.node !== (prev && prev.node) && !reduceMotion) {
      children[st.node].forEach(function (c, i) {
        var a = svg.querySelector('.node[data-node="' + c + '"]'), ln = document.getElementById("ln-" + c);
        [a, ln].forEach(function (x) { if (!x) return; x.classList.remove("is-revealing"); x.getBoundingClientRect(); x.style.setProperty("--k", i); x.classList.add("is-revealing"); });
      });
      var tr = document.getElementById("tr-" + family(st.node));
      if (tr) { tr.classList.remove("is-revealing"); tr.getBoundingClientRect(); tr.classList.add("is-revealing"); }
    }
  }

  function renderTrail(st) {
    if (!st.node) { trailEl.innerHTML = ""; return; }
    var path = ancestry(st.node), html = "";
    path.forEach(function (id, i) {
      var last = i === path.length - 1 && !st.piece && !st.view;
      html += (i ? '<span class="sep" aria-hidden="true">/</span>' : "") + '<a href="' + href({ node: id }) + '"' + (last ? ' aria-current="location"' : "") + ">" + S.code(id) + "</a>";
    });
    if (st.piece) html += '<span class="sep" aria-hidden="true">/</span><a href="' + href({ node: st.node, piece: st.piece }) + '" aria-current="location">' + S.esc(S.product(st.piece).code) + "</a>";
    trailEl.innerHTML = html;
  }

  /* ---------- panels ---------- */
  function confirmTag(c) { return c && c.confirmed ? "" : '<span class="tag-confirm">[Connection to confirm]</span>'; }
  function head(code, label) {
    return '<header class="panel-head"><span class="code">' + code + '</span><span class="label">' + label + '</span>' +
      '<button type="button" class="panel-close" data-close>Close</button></header>';
  }
  function pieceCard(p, highlight) {
    var c = S.connectionFor(p.id);
    return '<li><a class="piece-link' + (highlight ? " is-highlight" : "") + '" href="' + href({ node: c.node, piece: p.id }) + '">' +
      '<div class="frame">' + S.img(p.photos[0], { size: 480, sizes: "180px" }) + "</div>" +
      '<span class="meta"><span class="code">' + p.code + " · " + S.code(c.node) + '</span><span class="name">[Product name]</span>' + confirmTag(c) + "</span></a></li>";
  }
  function discoveries(id) {
    var fam = id === "chain" ? null : family(id);
    var out = '<nav class="discover" aria-label="Look closer">';
    out += '<a href="' + href({ node: id, view: "study" }) + '"><span class="d-k">Study</span><span class="d-v">' + S.code(id) + "</span></a>";
    if (fam) out += '<a href="drawer.html?family=' + fam + "&amp;from=" + encodeURIComponent(id) + '"><span class="d-k">Drawer</span><span class="d-v">' + S.code(fam) + "</span></a>";
    return out + "</nav>";
  }
  function nodePanel(st) {
    var id = st.node, n = nodes[id], kids = children[id] || [];
    var here = S.productsAt(id);
    var further = id === "chain" ? [] : descendants(id).reduce(function (acc, d) { return acc.concat(S.productsAt(d)); }, []);
    var h = head(S.code(id), id === "chain" ? "Origin" : "Level " + n.depth);
    if (id !== "chain") h += '<figure class="panel-glyph" aria-hidden="true">' + S.glyphSvg(id) + "</figure>";
    else h += '<figure class="panel-glyph panel-glyph--chain" aria-hidden="true">' + S.chainSvg(3) + "</figure>";
    h += '<h2 class="ph-h" id="panel-title" tabindex="-1">[Heading]</h2><p class="ph-t">[Text]</p>';
    if (here.length) h += '<section aria-labelledby="pc-h"><h3 class="label" id="pc-h">Pieces</h3><ul class="piece-list">' + here.map(function (p) { return pieceCard(p, p.id === st.from); }).join("") + "</ul></section>";
    if (id === "chain") {
      var all = CONN.map(function (c) { return S.product(c.product); }).filter(Boolean);
      h += '<section aria-labelledby="pa-h"><h3 class="label" id="pa-h">Pieces on the drawing</h3><ul class="piece-list">' + all.map(function (p) { return pieceCard(p, false); }).join("") + "</ul></section>";
    }
    if (id === "chain" || n.depth === 1) h += '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>';
    if (kids.length) {
      h += '<section aria-labelledby="br-h"><h3 class="label" id="br-h">Branches</h3><ul class="branch-list">' + kids.map(function (k) {
        var count = descendants(k).length + S.productsAt(k).length;
        return '<li><a href="' + href({ node: k }) + '">' + S.glyphSvg(k) + '<span class="code">' + S.code(k) + "</span>" +
          (count ? '<span class="n">' + count + " →</span>" : "") + "</a></li>";
      }).join("") + "</ul></section>";
    }
    if (further.length) {
      h += '<section aria-labelledby="fu-h"><h3 class="label" id="fu-h">Further along</h3><ul class="further">' + further.map(function (p) {
        var c = S.connectionFor(p.id);
        return '<li><a href="' + href({ node: c.node }) + '">' + ancestry(c.node).slice(ancestry(id).length - 1).map(S.code).join(" / ") + "</a></li>";
      }).join("") + "</ul></section>";
    }
    h += discoveries(id);
    h += '<nav class="panel-nav" aria-label="Panel navigation">';
    if (n.parent) h += '<a class="btn" href="' + href({ node: n.parent }) + '"><span class="arrow arrow--back"></span>Toward origin · ' + S.code(n.parent) + "</a>";
    h += '<a class="btn" href="map.html" data-overview>Overview</a></nav>';
    return h;
  }
  function piecePanel(st) {
    var p = S.product(st.piece), c = S.connectionFor(p.id), origin = c ? c.node : st.node;
    var h = head(p.code, "Piece");
    h += '<figure class="piece-main" id="piece-main">' + S.img(p.photos[0], { size: 960, sizes: "(max-width: 900px) 100vw, 420px" }) + "</figure>";
    if (p.photos.length > 1) h += '<div class="thumbs" role="group" aria-label="Photos">' + p.photos.map(function (ph, i) {
      return '<button type="button" data-photo="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Photo ' + (i + 1) + '"><img src="' + S.src(ph.base, 480) + '" alt="" loading="lazy"></button>';
    }).join("") + "</div>";
    h += '<h2 class="ph-h" id="panel-title" tabindex="-1">[Product name]</h2><p class="ph-t">[Product details]</p>';
    h += '<div class="origin-row"><span class="label">Origin</span><a href="' + href({ node: origin, from: p.id }) + '">' + ancestry(origin).map(S.code).join(" / ") + "</a>" + confirmTag(c) + "</div>";
    h += '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>';
    h += '<nav class="panel-nav" aria-label="Piece navigation"><a class="btn btn--solid" href="product.html?id=' + encodeURIComponent(p.id) + '">View piece<span class="arrow"></span></a>' +
      '<a class="btn" href="' + href({ node: origin, from: p.id }) + '"><span class="arrow arrow--back"></span>Back to origin</a></nav>';
    h += discoveries(origin);
    var others = S.products.filter(function (o) { return o.id !== p.id && S.connectionFor(o.id); });
    if (others.length) h += '<section aria-labelledby="cp-h"><h3 class="label" id="cp-h">Connected pieces</h3><ul class="piece-list">' + others.map(function (o) { return pieceCard(o, false); }).join("") + "</ul></section>";
    return h;
  }
  function wirePanel(st) {
    panelContent.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { navigate({}); }); });
    var ov = panelContent.querySelector("[data-overview]");
    if (ov) ov.addEventListener("click", function () { setTimeout(function () { overviewCam(); }, 0); });
    panelContent.querySelectorAll("[data-photo]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ph = S.product(st.piece).photos[+b.getAttribute("data-photo")];
        document.getElementById("piece-main").innerHTML = S.img(ph, { size: 960, sizes: "(max-width: 900px) 100vw, 420px" });
        panelContent.querySelectorAll("[data-photo]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      });
    });
  }

  /* ---------- hidden study view ---------- */
  function studyContent(id) {
    var n = nodes[id], fam = id === "chain" ? "chain" : family(id), sketch = id === "chain" ? M.chain.sketch : nodes[fam].sketch;
    var sib = id === "chain" ? [] : children[n.parent], i = sib.indexOf(id);
    var h = '<div class="study-head"><span class="code">' + S.code(id) + '</span><span class="label">Study</span>' +
      '<button type="button" class="panel-close" data-study-close>Close</button></div>';
    h += '<div class="study-body">';
    if (id === "chain") {
      h += '<figure class="study-art study-anatomy" id="anatomy" aria-label="The chain link, drawn in parts">' + S.anatomySvg() + "</figure>";
    } else {
      h += '<figure class="study-art" aria-hidden="true">' + S.glyphSvg(id, null, true) + "</figure>";
    }
    h += '<div class="study-side"><h2 class="ph-h" id="study-title" tabindex="-1">[Heading]</h2><p class="ph-t">[Text]</p>';
    if (id === "chain") h += '<button type="button" class="btn" id="anatomy-toggle" aria-pressed="false">Separate</button>';
    if (sketch) {
      h += '<details class="sketch"><summary>Sketch detail</summary><figure><img src="assets/web/sketch/' + sketch + '.jpg" alt="Detail of the client\'s original pen drawing for this part of the sheet" loading="lazy">' +
        '<figcaption class="label">[Sketch detail]</figcaption></figure></details>';
    }
    h += '<div class="media-slot" role="img" aria-label="Space for a future video"><small>Video placement</small><span>[Video]</span></div>';
    if (children[id] && children[id].length) {
      h += '<h3 class="label">Branches</h3><ul class="study-branches">' + children[id].map(function (k) {
        return '<li><a href="' + href({ node: k, view: "study" }) + '" aria-label="Study ' + S.code(k) + '">' + S.glyphSvg(k) + "<span>" + S.code(k) + "</span></a></li>";
      }).join("") + "</ul>";
    }
    h += '<nav class="panel-nav" aria-label="Study navigation">';
    if (sib.length > 1) {
      h += '<a class="btn" href="' + href({ node: sib[(i - 1 + sib.length) % sib.length], view: "study" }) + '"><span class="arrow arrow--back"></span>' + S.code(sib[(i - 1 + sib.length) % sib.length]) + "</a>";
      h += '<a class="btn" href="' + href({ node: sib[(i + 1) % sib.length], view: "study" }) + '">' + S.code(sib[(i + 1) % sib.length]) + '<span class="arrow"></span></a>';
    }
    h += "</nav></div></div>";
    return h;
  }
  function openStudy(st, focus) {
    study.innerHTML = studyContent(st.node);
    study.hidden = false;
    document.body.classList.add("has-study");
    study.querySelector("[data-study-close]").addEventListener("click", closeStudy);
    var tog = document.getElementById("anatomy-toggle");
    if (tog) tog.addEventListener("click", function () {
      var on = tog.getAttribute("aria-pressed") !== "true";
      tog.setAttribute("aria-pressed", String(on));
      tog.textContent = on ? "Join" : "Separate";
      document.getElementById("anatomy").classList.toggle("is-apart", on);
    });
    if (focus) document.getElementById("study-title").focus({ preventScroll: true });
  }
  function closeStudy() {
    if (history.state && history.state.study) history.back();
    else navigate({ node: current.node }, { replace: true });
  }

  /* ---------- render state ---------- */
  function render(st, opts) {
    opts = opts || {};
    var prev = current;
    current = st;
    if (st.node) remember(st.node);
    updateClasses(st, prev);
    renderTrail(st);
    updateCount();

    if (st.view) openStudy(st, opts.user || opts.initial);
    else if (!study.hidden) {
      study.hidden = true; study.innerHTML = "";
      document.body.classList.remove("has-study");
    }

    if (!st.node) {
      if (!panel.hidden) {
        panel.hidden = true;
        document.body.classList.remove("has-panel");
        var back = lastNode && svg.querySelector('[data-node="' + lastNode + '"]');
        if (opts.user && back) back.focus({ preventScroll: true });
      }
      document.title = "Origin — Vasili";
      if (opts.fromHistory || opts.initial) overviewCam(opts.initial);
      return;
    }
    panelContent.innerHTML = st.piece ? piecePanel(st) : nodePanel(st);
    panel.hidden = false;
    panel.scrollTop = 0;
    document.body.classList.add("has-panel");
    wirePanel(st);
    lastNode = st.node;
    document.title = (st.piece ? S.product(st.piece).code : S.code(st.node)) + " — Origin — Vasili";

    var moved = !(prev.node === st.node && prev.piece === st.piece);
    if (st.node === "chain") { if (moved) overviewCam(opts.initial); }
    else if (moved) focusBox(boxFor(st.node, st.piece), opts.initial);
    if (!st.view && (opts.user || opts.initial)) {
      var t = document.getElementById("panel-title");
      if (t) t.focus({ preventScroll: true });
    }
  }

  /* ---------- index (list view) ---------- */
  function updateCount() {
    var el = document.getElementById("found-count");
    if (el) el.textContent = Object.keys(found).filter(function (k) { return nodes[k]; }).length + " / " + (M.nodes.length + 1);
  }
  function buildIndex() {
    function list(id) {
      var kids = children[id] || [];
      if (!kids.length) return "";
      return "<ul>" + kids.map(function (k) {
        return '<li><a href="' + href({ node: k }) + '"' + (found[k] ? ' class="is-found"' : "") + ">" + S.code(k) + "</a>" + list(k) + "</li>";
      }).join("") + "</ul>";
    }
    var html = '<p class="label">Found <span id="found-count"></span></p>';
    html += '<ul><li><a href="' + href({ node: "chain" }) + '">' + S.code("chain") + "</a>" + list("chain") + "</li></ul>";
    html += '<div class="idx-pieces"><h3 class="label">Pieces</h3><ul>' + CONN.map(function (c) {
      var p = S.product(c.product);
      return p ? '<li><a href="' + href({ node: c.node, piece: p.id }) + '">' + p.code + " · " + S.code(c.node) + "</a></li>" : "";
    }).join("") + '<li><a href="shop.html">Shop</a></li></ul></div>';
    document.getElementById("index-list").innerHTML = html;
    updateCount();
  }
  var dlg = document.getElementById("index-dialog");
  document.getElementById("map-index-open").addEventListener("click", function () { buildIndex(); dlg.showModal(); });
  document.getElementById("index-close").addEventListener("click", function () { dlg.close(); });

  /* ---------- boot ---------- */
  renderLines();
  renderChain();
  renderNodes();
  renderPieces();
  buildIndex();
  apply();
  overviewCam(true);
  var initial = readURL();
  if (initial.node) { dismissHint(); svg.classList.remove("is-intro"); }
  render(initial, { initial: !!initial.node });
  setTimeout(function () { svg.classList.remove("is-intro"); }, reduceMotion ? 0 : 3600);
  window.addEventListener("resize", function () {
    if (current.node && current.node !== "chain") focusBox(boxFor(current.node, current.piece), true); else overviewCam(true);
  });
})();
