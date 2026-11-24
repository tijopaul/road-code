#!/usr/bin/env python3
"""Extract Ornikar saved lesson pages into Study Site/js/content.js + Study Site/img/.

Run from anywhere:  python3 -I "Study Site/build/extract.py"
Only uses the Python standard library (plus macOS `sips` for shrinking images).
"""
import base64, hashlib, html, json, os, re, shutil, subprocess, sys
from html.parser import HTMLParser

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(SITE)
IMG_DIR = os.path.join(SITE, "img")
MAX_W = 1000
MIN_BYTES = 1500  # skip tiny icons

NAV_TEXT = {"to leave", "following", "previous", "next", "ornikar", "continue", "finish", "start"}


class LessonParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []          # list of (tag, kind) ; kind = text-kind for is_Text spans
        self.blocks = []
        self.cur = None          # (kind, [text parts], depth)
        self.pending_alt = None

    @staticmethod
    def kind_of(cls):
        if "is_Text" not in cls:
            return None
        if "font_label" in cls:
            return "label"
        if "font_heading" in cls:
            return "h2"
        if "_textAlign-center" in cls and "body1510" in cls:
            return "caption"
        if "_fw-f-weight-bo" in cls:
            return "h3"
        return "p"

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "img":
            src = a.get("src") or ""
            if src.startswith("data:image"):
                self.flush()
                self.blocks.append({"t": "img", "src": src, "alt": a.get("alt") or ""})
            return
        if tag in ("br",):
            if self.cur:
                self.cur[1].append("\n")
            return
        if tag in ("li",):
            if self.cur:
                self.cur[1].append("\n• ")
        kind = self.kind_of(a.get("class") or "") if tag == "span" else None
        if kind and self.cur is None:
            self.cur = [kind, [], len(self.stack)]
        if tag in ("b", "strong") and self.cur:
            self.cur[1].append("**")
        self.stack.append((tag, kind))

    def handle_endtag(self, tag):
        # pop until matching tag
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                if tag in ("b", "strong") and self.cur:
                    self.cur[1].append("**")
                del self.stack[i:]
                break
        if self.cur and len(self.stack) <= self.cur[2]:
            self.flush()

    def handle_data(self, data):
        if self.cur is not None:
            self.cur[1].append(data)

    def flush(self):
        if not self.cur:
            return
        kind, parts, _ = self.cur
        self.cur = None
        text = re.sub(r"[ \t ]+", " ", "".join(parts)).replace("****", "").strip()
        text = re.sub(r"\n\s*", "\n", text)
        text = re.sub(r"[​‌﻿]", "", text)
        if text:
            self.blocks.append({"t": kind, "x": text})


def save_image(src, seen):
    m = re.match(r"data:image/([a-zA-Z+]+);base64,(.*)", src, re.S)
    if not m:
        return None
    ext = {"jpeg": "jpg", "jpg": "jpg", "png": "png", "webp": "webp", "gif": "gif", "svg+xml": "svg"}.get(m.group(1).lower(), "img")
    try:
        raw = base64.b64decode(m.group(2))
    except Exception:
        return None
    if len(raw) < MIN_BYTES:
        return None
    h = hashlib.sha1(raw).hexdigest()[:14]
    name = f"{h}.{ext}"
    path = os.path.join(IMG_DIR, name)
    if name not in seen:
        seen.add(name)
        if not os.path.exists(path) and not os.path.exists(os.path.splitext(path)[0] + ".webp"):
            with open(path, "wb") as f:
                f.write(raw)
    return name


def clean_blocks(blocks):
    """Drop navigation chrome; keep lesson body between duration and trailing 'Activity'."""
    out = []
    duration = None
    started = False
    for b in blocks:
        x = b.get("x", "")
        if b["t"] == "label":
            continue
        if not started:
            if b["t"] == "p" and re.fullmatch(r"\d+\s*minutes?", x, re.I):
                duration = x
                started = True
            continue
        if b["t"] != "img" and (x.lower() in NAV_TEXT or re.fullmatch(r"\d+\s*/\s*\d+", x)):
            continue
        if b["t"] != "img" and x.lower() == "activity":
            continue
        if b["t"] != "img" and re.match(r"(Ornikar tip|Astuce Ornikar)", x, re.I):
            continue  # promotional banner
        out.append(b)
    if not started:  # fallback: keep everything that isn't chrome
        out = [b for b in blocks if b["t"] != "label" and b.get("x", "").lower() not in NAV_TEXT]
    # captions: strip "/ © Ornikar"
    for b in out:
        if b["t"] == "caption":
            b["x"] = re.sub(r"\s*/?\s*©.*$", "", b["x"]).strip()
    return duration, out


def ts_key(fname):
    m = re.search(r"(\d+)：(\d+)：(\d+)\s*(AM|PM)", fname)
    if not m:
        return fname
    h, mi, s, ap = int(m[1]), int(m[2]), int(m[3]), m[4]
    if ap == "PM" and h != 12:
        h += 12
    return h * 3600 + mi * 60 + s


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    seen = set()
    themes = []
    theme_dirs = sorted(
        [d for d in os.listdir(ROOT) if d.startswith("Theme #")],
        key=lambda d: int(re.search(r"#(\d+)", d).group(1)),
    )
    stats = {"lessons": 0, "images": 0}
    for td in theme_dirs:
        num = int(re.search(r"#(\d+)", td).group(1))
        tname = td.split(" - ", 1)[1].strip()
        tpath = os.path.join(ROOT, td)
        subs = []
        sub_dirs = [d for d in os.listdir(tpath) if os.path.isdir(os.path.join(tpath, d))]
        # order sub-topics by earliest lesson timestamp (the order they were studied)
        def sub_key(d):
            files = [f for f in os.listdir(os.path.join(tpath, d)) if f.endswith(".html")]
            return min([ts_key(f) for f in files] or [0])
        for sd in sorted(sub_dirs, key=sub_key):
            spath = os.path.join(tpath, sd)
            files = sorted([f for f in os.listdir(spath) if f.endswith(".html")], key=ts_key)
            lessons = []
            for f in files:
                with open(os.path.join(spath, f), encoding="utf-8", errors="ignore") as fh:
                    s = fh.read()
                s = re.sub(r"<(script|style)\b[\s\S]*?</\1>", "", s)
                s = re.sub(r"<svg\b[\s\S]*?</svg>", "", s)
                p = LessonParser()
                p.feed(s)
                p.flush()
                duration, blocks = clean_blocks(p.blocks)
                final = []
                for b in blocks:
                    if b["t"] == "img":
                        name = save_image(b["src"], seen)
                        if name:
                            final.append({"t": "img", "src": name, "alt": b["alt"]})
                            stats["images"] += 1
                    else:
                        final.append(b)
                # attach following caption to image
                merged = []
                for b in final:
                    if b["t"] == "caption" and merged and merged[-1]["t"] == "img" and "cap" not in merged[-1]:
                        merged[-1]["cap"] = b["x"]
                    else:
                        merged.append(b)
                title = next((b["x"] for b in merged if b["t"] == "h2"), sd)
                lessons.append({"title": title, "duration": duration, "source": f, "blocks": merged})
                stats["lessons"] += 1
            subs.append({"name": sd, "lessons": lessons})
        themes.append({"num": num, "name": tname, "subtopics": subs})

    # Duplicate lessons (same body text re-saved under another sub-topic): keep the LAST occurrence.
    def sig(l):
        txt = "|".join(b.get("x", "") for b in l["blocks"] if b["t"] in ("h2", "h3", "p"))
        return hashlib.sha1(txt.encode()).hexdigest()
    last = {}
    for ti, t in enumerate(themes):
        for si, st in enumerate(t["subtopics"]):
            for l in st["lessons"]:
                last[sig(l)] = (ti, si)
    for ti, t in enumerate(themes):
        for si, st in enumerate(t["subtopics"]):
            before = len(st["lessons"])
            st["lessons"] = [l for l in st["lessons"] if last[sig(l)] == (ti, si)]
            if len(st["lessons"]) != before:
                print(f"removed {before - len(st['lessons'])} duplicate lesson(s) from {st['name']}")
    stats["lessons"] = sum(len(st["lessons"]) for t in themes for st in t["subtopics"])

    # Shrink images: resize to MAX_W and convert to WebP (keeps transparency) when cwebp exists.
    used = {b["src"] for t in themes for st in t["subtopics"] for l in st["lessons"] for b in l["blocks"] if b["t"] == "img"}
    rename = {}
    have_cwebp = shutil.which("cwebp") is not None
    if "--no-resize" not in sys.argv:
        for name in sorted(seen):
            path = os.path.join(IMG_DIR, name)
            if name not in used:
                if os.path.exists(path):
                    os.remove(path)
                continue
            if not os.path.exists(path):
                continue  # already converted on a previous run
            if not name.endswith((".jpg", ".png")):
                continue
            w = _width(path)
            if have_cwebp:
                webp = os.path.splitext(name)[0] + ".webp"
                cmd = ["cwebp", "-quiet", "-q", "72", "-m", "5"]
                if w > MAX_W:
                    cmd += ["-resize", str(MAX_W), "0"]
                r = subprocess.run(cmd + [path, "-o", os.path.join(IMG_DIR, webp)], capture_output=True)
                if r.returncode == 0:
                    os.remove(path)
                    rename[name] = webp
                    continue
            if w > MAX_W:
                subprocess.run(["sips", "--resampleWidth", str(MAX_W), path], capture_output=True)
        print(f"processed images ({len(rename)} converted to webp)")
    for t in themes:
        for st in t["subtopics"]:
            for l in st["lessons"]:
                for b in l["blocks"]:
                    if b["t"] == "img":
                        b["src"] = rename.get(b["src"], b["src"])
                        # an existing .webp from a previous run
                        if b["src"].endswith((".jpg", ".png")) and not os.path.exists(os.path.join(IMG_DIR, b["src"])):
                            alt = os.path.splitext(b["src"])[0] + ".webp"
                            if os.path.exists(os.path.join(IMG_DIR, alt)):
                                b["src"] = alt

    out = os.path.join(SITE, "js", "content.js")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write("// Generated by build/extract.py — do not edit by hand.\n")
        f.write("window.CONTENT = ")
        json.dump({"themes": themes}, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"lessons: {stats['lessons']}  image refs: {stats['images']}  unique images: {len(used)}")


def _width(path):
    r = subprocess.run(["sips", "-g", "pixelWidth", path], capture_output=True, text=True)
    m = re.search(r"pixelWidth:\s*(\d+)", r.stdout)
    return int(m.group(1)) if m else 0


if __name__ == "__main__":
    main()
