#!/usr/bin/env python3
"""
Checks that the site can be served by GitHub Pages from the repository root
("Deploy from a branch" -> main -> / (root)). Standard library only.

  python3 tools/check-pages.py

Fails (exit 1) if:
  - index.html or .nojekyll is missing at the root
  - a local link/asset doesn't exist with EXACTLY that letter case
    (GitHub Pages is case-sensitive; macOS/Windows usually are not)
  - a path starts with "/" (would break under https://<user>.github.io/<repo>/)
  - a path climbs above the site root with "../"
  - a photo referenced by data/products.js is missing a web size
  - a file is over GitHub's 100 MB limit
  - a regular page links to the hidden map/drawer (only the FAQ answer may)
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors, checked = [], 0


def exists_exact(rel):
    """True only if every path segment matches on-disk names exactly."""
    cur = ROOT
    for part in rel.split("/"):
        if part in ("", "."):
            continue
        try:
            names = os.listdir(cur)
        except NotADirectoryError:
            return False
        if part not in names:
            return False
        cur = os.path.join(cur, part)
    return True


def check_ref(ref, src_file, base=None):
    global checked
    ref = ref.strip()
    if not ref or ref.startswith(("http://", "https://", "data:", "mailto:", "#", "%23", "?", "javascript:")):
        return
    if ref.startswith("//"):
        return
    if ref.startswith("/"):
        errors.append(f"{src_file}: root-absolute path '{ref}' breaks under a repository subpath")
        return
    path = ref.split("#")[0].split("?")[0]
    if not path:
        return
    # HTML/CSS resolve relative to their own folder; paths built in JS resolve
    # relative to the page that runs the script, i.e. the site root.
    base = os.path.dirname(src_file) if base is None else base
    full = os.path.normpath(os.path.join(base, path)).replace(os.sep, "/")
    if full.startswith(".."):
        errors.append(f"{src_file}: '{ref}' points outside the site root")
        return
    checked += 1
    if not exists_exact(full):
        errors.append(f"{src_file}: missing or wrong case -> '{ref}'")


ATTR = re.compile(r'''(?:src|href|imagesrcset|srcset)\s*=\s*["']([^"']+)["']''', re.I)
CSS_URL = re.compile(r'''url\(\s*["']?([^"')]+)["']?\s*\)''')

for name in (".nojekyll", "index.html"):
    if not os.path.isfile(os.path.join(ROOT, name)):
        errors.append(f"missing {name} at repository root")

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d != ".git"]
    for fn in filenames:
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
        if os.path.getsize(full) > 100 * 1024 * 1024:
            errors.append(f"{rel}: over GitHub's 100 MB file limit")
        if fn.endswith(".html"):
            text = open(full, encoding="utf-8").read()
            for m in ATTR.finditer(text):
                val = m.group(1)
                if "srcset" in m.group(0).lower():
                    for part in val.split(","):
                        check_ref(part.strip().split(" ")[0], rel)
                else:
                    check_ref(val, rel)
        elif fn.endswith(".css"):
            for m in CSS_URL.finditer(open(full, encoding="utf-8").read()):
                check_ref(m.group(1), rel)

# Script/style tags load data + code; photos are built from base names in JS.
products = open(os.path.join(ROOT, "data", "products.js"), encoding="utf-8").read()
for base in re.findall(r'base:\s*"([^"]+)"', products):
    for size in (480, 960, 1600):
        check_ref(f"assets/web/{base}-{size}.jpg", "data/products.js", base="")

# Paths written as string literals inside JS (e.g. "assets/brand/...").
for fn in os.listdir(os.path.join(ROOT, "js")):
    text = open(os.path.join(ROOT, "js", fn), encoding="utf-8").read()
    for m in re.finditer(r'''["'](assets/[^"'+]+\.\w+)["']''', text):
        check_ref(m.group(1), "js/" + fn, base="")

# The origin map is a discovery: regular pages must not link to it, except the
# one contextual FAQ answer (product descriptions add theirs from js/pages.js).
HIDDEN = re.compile(r'href="(?:\./)?(?:map|drawer)\.html')
for fn in sorted(os.listdir(ROOT)):
    if not fn.endswith(".html") or fn in ("map.html", "drawer.html"):
        continue
    n = len(HIDDEN.findall(open(os.path.join(ROOT, fn), encoding="utf-8").read()))
    allowed = 1 if fn == "faq.html" else 0
    if n != allowed:
        errors.append(f"{fn}: {n} link(s) to the hidden map/drawer (allowed: {allowed})")

if errors:
    print("NOT READY for GitHub Pages:")
    for e in errors:
        print("  - " + e)
    sys.exit(1)
print(f"OK: {checked} local references resolve with exact case; index.html and .nojekyll at root.")
