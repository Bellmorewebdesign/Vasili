#!/usr/bin/env python3
"""
Builds every page of the sample site from one shared header/footer, so the
navigation stays identical everywhere. Output is plain HTML in the repository
root (GitHub Pages serves it as-is; no build step is needed to deploy).

  python3 tools/build-pages.py

Edit the page bodies below, re-run, and commit the generated .html files.

Navigation rule: the origin map (map.html) and its hidden pages (drawer.html)
are NEVER linked from the header, menu, footer or homepage. The only entries
are a product description's "See origin" link and one FAQ answer.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COLLECTIONS = [
    ("shop.html", "All products"), ("collection.html", "Frontpage"),
    ("collection-bracelet.html", "Bracelet"), ("collection-earring.html", "Earring"),
    ("collection-necklace.html", "Necklace"), ("collection-object.html", "Object"),
    ("collection-ring.html", "Ring"),
]
STUDIO = [("about.html", "About"), ("preface.html", "Preface"),
          ("collaborations.html", "Collaborations"), ("custom-inquiries.html", "Custom Inquiries")]
NEWS = [("news.html", "News"), ("blog.html", "News blog")]
HELP = [("faq.html", "FAQ"), ("shipping-policy.html", "Shipping Policy"), ("return-policy.html", "Return Policy")]

FONT = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400'
        '&family=IBM+Plex+Mono:wght@400;500&display=swap" media="print" onload="this.media=\'all\'">')

SCRIPTS = ["data/origin-map.js", "data/products.js", "data/collections.js",
           "data/demo-connections.js", "js/glyphs.js", "js/site.js"]


def links(items, current, cls=""):
    out = []
    for href, label in items:
        cur = ' aria-current="page"' if href == current else ""
        out.append(f'<li><a href="{href}"{cur}{cls}>{label}</a></li>')
    return "\n".join(out)


def header(current):
    cur = lambda h: ' aria-current="page"' if h == current else ""
    return f'''  <header class="site-header">
    <nav class="nav-main" aria-label="Primary">
      <a href="shop.html"{cur("shop.html")}>Shop</a>
      <div class="dd">
        <button type="button" class="dd-toggle" id="collections-toggle" aria-expanded="false" aria-controls="collections-menu">Collections</button>
        <div class="dd-panel" id="collections-menu" hidden>
          <ul>
{links(COLLECTIONS, current)}
          </ul>
        </div>
      </div>
    </nav>
    <a class="logo" href="index.html"><img src="assets/brand/vasili-logo-white.svg" alt="Vasili — home" width="243" height="104"></a>
    <nav class="nav-side" aria-label="Secondary">
      <a class="hide-sm" href="about.html"{cur("about.html")}>About</a>
      <a class="hide-sm" href="news.html"{cur("news.html")}>News</a>
      <a class="show-sm" href="shop.html">Shop</a>
      <button type="button" class="menu-btn" id="menu-open" aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu">Menu</button>
    </nav>
  </header>
  <dialog class="site-menu" id="site-menu" aria-label="Menu">
    <div class="menu-head">
      <img src="assets/brand/vasili-logo-white.svg" alt="" width="243" height="104">
      <button type="button" class="btn" data-menu-close>Close</button>
    </div>
    <div class="menu-groups">
      <section><h2 class="label">Shop</h2><ul>
{links(COLLECTIONS, current)}
      </ul></section>
      <section><h2 class="label">Studio</h2><ul>
{links(STUDIO, current)}
      </ul></section>
      <section><h2 class="label">News</h2><ul>
{links(NEWS, current)}
      </ul></section>
      <section><h2 class="label">Help</h2><ul>
{links(HELP, current)}
      </ul></section>
    </div>
  </dialog>
'''


def footer(page):
    return f'''  <footer class="site-footer">
    <form class="signup" novalidate data-visual-only aria-labelledby="signup-h">
      <h2 class="ph-h" id="signup-h">[Heading]</h2>
      <div class="signup-row">
        <label class="sr-only" for="email-{page}">Email address</label>
        <input id="email-{page}" type="email" name="email" placeholder="[Email]" autocomplete="off">
        <button type="submit">Join</button>
      </div>
      <p class="note">[Text] — layout only, not connected.</p>
    </form>
    <nav class="footer-cols" aria-label="Footer">
      <div><h2 class="label">Shop</h2><ul>{links(COLLECTIONS, "")}</ul></div>
      <div><h2 class="label">Studio</h2><ul>{links(STUDIO, "")}</ul></div>
      <div><h2 class="label">News</h2><ul>{links(NEWS, "")}</ul></div>
      <div><h2 class="label">Help</h2><ul>{links(HELP, "")}</ul></div>
    </nav>
    <img class="footer-mark" src="assets/brand/vasili-logo-white.svg" alt="" width="243" height="104">
  </footer>
'''


def page(filename, title, body, page_id, css=("css/site.css", "css/pages.css"), extra_head="",
         with_footer=True, body_class="", scripts=("js/pages.js",), noindex=False, attrs=""):
    css_tags = "\n  ".join(f'<link rel="stylesheet" href="{c}">' for c in css)
    js = "\n  ".join(f'<script src="{s}"></script>' for s in SCRIPTS + list(scripts))
    robots = '\n  <meta name="robots" content="noindex">'
    html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{title}</title>{robots}
  <link rel="icon" href="assets/brand/vasili-logo-white.svg" type="image/svg+xml">
  {FONT}
  {css_tags}{extra_head}
</head>
<body data-page="{page_id}"{(' class="' + body_class + '"') if body_class else ""}{attrs}>
  <a class="skip" href="#main">Skip to content</a>
{header(filename)}
{body}
{footer(page_id) if with_footer else ""}
  {js}
</body>
</html>
'''
    with open(os.path.join(ROOT, filename), "w", encoding="utf-8") as fh:
        fh.write(html)
    return filename


def media(label="[Video]", kind="Video placement", ratio=""):
    style = f' style="aspect-ratio:{ratio}"' if ratio else ""
    return (f'<div class="media-slot" role="img" aria-label="Space for future {kind.split()[0].lower()} content"{style}>'
            f'<small>{kind}</small><span>{label}</span></div>')


def text_block(n=1):
    return "\n".join('<p class="ph-t">[Text]</p>' for _ in range(n))


built = []

# ---------------------------------------------------------------- home
built.append(page("index.html", "Vasili", '''  <main id="main">
    <section class="hero" aria-labelledby="hero-h">
      <div class="hero-copy">
        <h1 class="ph-h" id="hero-h">[Heading]</h1>
        <p class="ph-t">[Text]</p>
        <div class="hero-actions">
          <a class="btn btn--solid" href="shop.html">Shop<span class="arrow"></span></a>
          <a class="btn" href="collection.html">Collection</a>
        </div>
      </div>
      <div class="hero-chain-wrap"><svg class="hero-chain lw" id="hero-chain" aria-hidden="true" preserveAspectRatio="xMidYMid meet"></svg></div>
      <figure class="hero-photo" style="margin:0">
        <img src="assets/web/DSC07321-960.jpg"
             srcset="assets/web/DSC07321-480.jpg 480w, assets/web/DSC07321-960.jpg 960w, assets/web/DSC07321-1600.jpg 1600w"
             sizes="(max-width: 900px) 100vw, 42vw" fetchpriority="high"
             alt="Hands covered in silver rings and spurred bracelets held over an open flame">
      </figure>
    </section>

    <section class="rail" aria-labelledby="rail-h">
      <div class="rail-head">
        <h2 class="ph-h" id="rail-h">[Heading]</h2>
        <a class="btn" href="collection.html">Collection<span class="arrow"></span></a>
      </div>
      <div class="rail-track" id="rail-track" data-collection="frontpage"></div>
    </section>

    <section class="film" aria-label="Video">
      <div>
        ''' + media() + '''
        <div class="caption"><span class="code">[Video]</span><p class="ph-t">[Text]</p></div>
      </div>
      <figure>
        <img src="assets/web/cropextedobb-960.jpg"
             srcset="assets/web/cropextedobb-480.jpg 480w, assets/web/cropextedobb-960.jpg 960w, assets/web/cropextedobb-1600.jpg 1600w"
             sizes="(max-width: 900px) 70vw, 30vw" loading="lazy"
             alt="Silver spurred link chain worn as a necklace over a black turtleneck">
      </figure>
    </section>

    <section class="col-index" aria-labelledby="col-h">
      <div class="rail-head"><h2 class="ph-h" id="col-h">[Heading]</h2><a class="btn" href="shop.html">All products<span class="arrow"></span></a></div>
      <ul class="col-tiles" id="col-tiles"></ul>
    </section>

    <section class="ad-band" aria-label="Advertisement placement">
      <div class="ad-slot"><small>Ad placement — empty</small><span>[Ad]</span></div>
    </section>

    <section class="triptych" aria-label="Worn">
      <figure><img src="assets/web/VASILI121-960.jpg" srcset="assets/web/VASILI121-480.jpg 480w, assets/web/VASILI121-960.jpg 960w" sizes="(max-width: 900px) 50vw, 30vw" loading="lazy" alt="Gold link rings worn on several fingers against black clothing"></figure>
      <figure><img src="assets/web/20210107-_F6A3947-Edit-960.jpg" srcset="assets/web/20210107-_F6A3947-Edit-480.jpg 480w, assets/web/20210107-_F6A3947-Edit-960.jpg 960w, assets/web/20210107-_F6A3947-Edit-1600.jpg 1600w" sizes="40vw" loading="lazy" alt="Silver link bracelet worn on a wrist, with silver rings on the fingers"></figure>
      <figure><img src="assets/web/DCE7A7F3-43BB-4DA7-8AE6-09BA81EF0ECF-960.jpg" srcset="assets/web/DCE7A7F3-43BB-4DA7-8AE6-09BA81EF0ECF-480.jpg 480w, assets/web/DCE7A7F3-43BB-4DA7-8AE6-09BA81EF0ECF-960.jpg 960w" sizes="(max-width: 900px) 50vw, 30vw" loading="lazy" alt="Silver chain bracelet worn while holding a blue bicycle frame"></figure>
    </section>
  </main>''', "home",
    extra_head='\n  <link rel="preload" as="image" href="assets/web/DSC07321-960.jpg" imagesrcset="assets/web/DSC07321-480.jpg 480w, assets/web/DSC07321-960.jpg 960w, assets/web/DSC07321-1600.jpg 1600w" imagesizes="(max-width: 900px) 100vw, 42vw">'))

# ---------------------------------------------------------------- collections
for href, label in COLLECTIONS:
    cid = {"shop.html": "all", "collection.html": "frontpage"}.get(href, href[len("collection-"):-len(".html")])
    chips = links(COLLECTIONS, href)
    built.append(page(href, f"{label} — Vasili", f'''  <main id="main">
    <div class="page-head">
      <div>
        <span class="label">{label}</span>
        <h1 class="ph-h">[Heading]</h1>
        <p class="ph-t">[Text]</p>
      </div>
    </div>
    <nav class="chips" aria-label="Collections"><ul>
{chips}
    </ul></nav>
    <div class="collection-grid" id="collection-grid" data-collection="{cid}"></div>
  </main>''', "collection"))

# ---------------------------------------------------------------- product (template)
built.append(page("product.html", "Piece — Vasili", '''  <main id="main">
    <div id="product-root"><noscript><p class="missing"><a href="shop.html">Shop</a></p></noscript></div>
  </main>''', "product"))

# ---------------------------------------------------------------- studio pages
built.append(page("about.html", "About — Vasili", f'''  <main id="main" class="doc">
    <div class="split">
      <figure class="split-photo"><img src="assets/web/VASILI129-960.jpg" srcset="assets/web/VASILI129-480.jpg 480w, assets/web/VASILI129-960.jpg 960w, assets/web/VASILI129-1600.jpg 1600w" sizes="(max-width: 900px) 100vw, 45vw" alt="Gold link rings worn on a hand held against black lace"></figure>
      <div class="split-copy">
        <span class="label">About</span>
        <h1 class="ph-h">[Heading]</h1>
        {text_block(2)}
        <h2 class="ph-h ph-h--sm">[Heading]</h2>
        {text_block(1)}
      </div>
    </div>
    <section class="wrap band-media">{media()}</section>
  </main>''', "about"))

built.append(page("preface.html", "Preface — Vasili", f'''  <main id="main" class="doc doc--narrow">
    <span class="label">Preface</span>
    <h1 class="ph-h">[Heading]</h1>
    <div class="divider" id="chain-divider" aria-hidden="true"></div>
    {"".join(f'<section class="chapter"><span class="code">{n}</span><h2 class="ph-h ph-h--sm">[Heading]</h2>{text_block(2)}</section>' for n in ("I", "II", "III"))}
    {media()}
  </main>''', "preface"))

built.append(page("collaborations.html", "Collaborations — Vasili", f'''  <main id="main" class="doc">
    <div class="page-head page-head--flush"><div><span class="label">Collaborations</span><h1 class="ph-h">[Heading]</h1><p class="ph-t">[Text]</p></div></div>
    <ul class="collab-grid">
      {"".join(f'<li><div class="frame-empty">[Image]</div><span class="code">{i:02d}</span><h2 class="name">[Collaborator]</h2><p class="ph-t">[Text]</p></li>' for i in range(1, 5))}
    </ul>
    {media()}
  </main>''', "collaborations"))

built.append(page("custom-inquiries.html", "Custom Inquiries — Vasili", '''  <main id="main" class="doc">
    <div class="split split--form">
      <div class="split-copy">
        <span class="label">Custom Inquiries</span>
        <h1 class="ph-h">[Heading]</h1>
        <p class="ph-t">[Text]</p>
        <p class="ph-t">[Text]</p>
      </div>
      <form class="inquiry" novalidate data-visual-only aria-label="Custom inquiry (layout only)">
        <label>Name<input type="text" name="name" placeholder="[Name]" autocomplete="off"></label>
        <label>Email<input type="email" name="email" placeholder="[Email]" autocomplete="off"></label>
        <label>Piece<select name="type"><option>[Option]</option><option>[Option]</option><option>[Option]</option></select></label>
        <label>Details<textarea name="details" rows="6" placeholder="[Details]"></textarea></label>
        <label>Reference image<input type="file" name="file" disabled></label>
        <button class="btn btn--solid" type="submit">Send</button>
        <p class="note">Layout only — this form is not connected.</p>
      </form>
    </div>
  </main>''', "custom-inquiries"))

# ---------------------------------------------------------------- help
faq_items = []
for g, (group, qs) in enumerate([("Pieces", 3), ("Orders", 3), ("Care", 2)]):
    rows = []
    for i in range(qs):
        answer = '<p class="ph-t">[Answer]</p>'
        if g == 0 and i == 1:
            # The one contextual way in from the regular site (besides product descriptions).
            answer = ('<p class="ph-t">[Answer — about the drawings behind the pieces] '
                      '<a class="inline-link" href="map.html">See origin</a></p>')
        rows.append(f'<details class="faq-item"><summary><span class="ph-q">[Question]</span></summary>{answer}</details>')
    faq_items.append(f'<section class="faq-group"><h2 class="label">{group}</h2>{"".join(rows)}</section>')
built.append(page("faq.html", "FAQ — Vasili", f'''  <main id="main" class="doc doc--narrow">
    <span class="label">FAQ</span>
    <h1 class="ph-h">[Heading]</h1>
    {"".join(faq_items)}
    <p class="ph-t faq-more">[Text] <a class="inline-link" href="custom-inquiries.html">Custom Inquiries</a></p>
  </main>''', "faq"))


def policy(filename, label):
    secs = "".join(f'<section><h2 class="ph-h ph-h--sm">[Section]</h2>{text_block(2)}</section>' for _ in range(4))
    return page(filename, f"{label} — Vasili", f'''  <main id="main" class="doc doc--narrow policy">
    <span class="label">{label}</span>
    <h1 class="ph-h">[Heading]</h1>
    <p class="code">Last updated [Date]</p>
    {secs}
  </main>''', "policy")


built.append(policy("shipping-policy.html", "Shipping Policy"))
built.append(policy("return-policy.html", "Return Policy"))

# ---------------------------------------------------------------- news + blog
built.append(page("news.html", "News — Vasili", f'''  <main id="main" class="doc">
    <div class="page-head page-head--flush"><div><span class="label">News</span><h1 class="ph-h">[Heading]</h1><p class="ph-t">[Text]</p></div>
      <a class="btn" href="blog.html">News blog<span class="arrow"></span></a></div>
    <ol class="news-list">
      {"".join(f'<li><span class="code">[Date]</span><a href="blog-post.html?id={i}">[News item]</a><span class="ph-t">[Text]</span></li>' for i in (1, 2, 3))}
    </ol>
    {media("[Video]")}
  </main>''', "news"))

built.append(page("blog.html", "News blog — Vasili", f'''  <main id="main" class="doc">
    <div class="page-head page-head--flush"><div><span class="label">News blog</span><h1 class="ph-h">[Heading]</h1></div>
      <a class="btn" href="news.html"><span class="arrow arrow--back"></span>News</a></div>
    <ul class="post-grid">
      {"".join(f'<li><a href="blog-post.html?id={i}"><div class="frame-empty">[Image]</div><span class="code">[Date]</span><h2 class="name">[Post title]</h2><p class="ph-t">[Excerpt]</p></a></li>' for i in (1, 2, 3))}
    </ul>
  </main>''', "blog"))

built.append(page("blog-post.html", "Post — Vasili", f'''  <main id="main" class="doc doc--narrow article">
    <nav class="crumbs crumbs--flush" aria-label="Breadcrumb"><a href="blog.html">News blog</a><span aria-hidden="true">/</span><span aria-current="page" id="post-code">Post</span></nav>
    <span class="code">[Date]</span>
    <h1 class="ph-h">[Post title]</h1>
    <div class="frame-empty frame-empty--wide">[Image]</div>
    {text_block(3)}
    {media()}
    <nav class="post-nav" aria-label="More posts" id="post-nav"></nav>
  </main>''', "post"))

# ---------------------------------------------------------------- hidden: map + drawer
built.append(page("map.html", "Origin — Vasili", '''  <main id="main" class="map-page">
    <div class="map-stage" id="stage" tabindex="0"
         aria-label="Drawing canvas. Drag, or use the arrow keys, to move. Plus and minus keys zoom. Tab to reach each form.">
      <svg id="map" class="lw is-intro" xmlns="http://www.w3.org/2000/svg" aria-labelledby="map-title">
        <title id="map-title">Explorable redraw of the client's chain drawing and the forms that branch from it</title>
        <g id="world">
          <g id="line-layer"></g>
          <g id="trace-layer"></g>
          <g id="chain-layer"></g>
          <g id="node-layer"></g>
          <g id="piece-layer"></g>
        </g>
      </svg>
    </div>

    <nav class="map-trail" id="trail" aria-label="Path from the chain to the selected form"></nav>

    <div class="map-tools" role="toolbar" aria-label="Map controls">
      <button type="button" class="tool" id="zoom-in" aria-label="Zoom in">+</button>
      <button type="button" class="tool" id="zoom-out" aria-label="Zoom out">&minus;</button>
      <button type="button" class="tool tool--text" id="overview">Overview</button>
      <button type="button" class="tool tool--text" id="map-index-open">Index</button>
      <a class="tool tool--text tool--link" href="shop.html">Shop</a>
    </div>

    <p class="map-hint" id="hint" aria-hidden="true">Drag to move &nbsp;·&nbsp; Select a form</p>

    <aside class="panel" id="panel" aria-labelledby="panel-title" hidden>
      <div class="panel-inner" id="panel-content"></div>
    </aside>

    <div class="study" id="study" role="dialog" aria-modal="true" aria-labelledby="study-title" hidden></div>

    <dialog class="index-dialog" id="index-dialog" aria-labelledby="index-title">
      <div class="index-head">
        <h2 class="label" id="index-title">Index</h2>
        <button type="button" class="btn" id="index-close">Close</button>
      </div>
      <div id="index-list"></div>
    </dialog>

    <noscript><p class="noscript">This page needs JavaScript. <a href="shop.html">Shop</a></p></noscript>
  </main>''', "map", css=("css/site.css", "css/map.css"), with_footer=False, body_class="is-map",
    scripts=("js/map.js",), noindex=True))

built.append(page("drawer.html", "Drawer — Vasili", '''  <main id="main" class="drawer-page">
    <div id="drawer-root"><noscript><p class="missing"><a href="shop.html">Shop</a></p></noscript></div>
  </main>''', "drawer", noindex=True))

print("built:", ", ".join(built))
