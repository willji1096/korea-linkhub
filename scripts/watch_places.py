#!/usr/bin/env python3
"""Daily watch: did an official hours / closing-day page change since yesterday?

For every place, fetches the official pages its hours and closures come from,
keeps only the lines that talk about hours, closures or fees, and compares them
with the last snapshot. Changed pages are listed in reports/place-watch.md with
the changed lines, and the run exits 1 so GitHub emails the owner.

Nothing is changed automatically: a person reads the official page and updates
places.json. A wrong automatic edit would publish wrong hours.

Usage: python3 scripts/watch_places.py [--state DIR]
"""
import argparse
import difflib
import hashlib
import html
import json
import pathlib
import re
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from check_links import DATA, LOOSE_TLS, REPORTS, UA  # noqa: E402

# Source fields that carry hours / closing days / fees.
FIELD_WORDS = ("hour", "clos", "holiday", "admission", "open", "notice", "fee", "ticket")
# One-off notice posts don't change; watching them only adds noise.
SKIP_URL = re.compile(r"schM=view|boardView|/archives/")
# Lines worth comparing. Everything else (menus, banners, counters) is ignored.
KEEP = re.compile(
    r"휴관|휴궁|휴무|관람\s*시간|운영\s*시간|개방|입장|마감|요금|관람료|무료|임시|야간|"
    r"closed|closure|closing|open|hours|admission|last entry|free|fee|temporar|"
    r"\d{1,2}:\d{2}",
    re.I,
)
# "Today's viewing hours: 9:30–21:00" changes every day by design — skip it and the line after.
TODAY = re.compile(r"today|오늘", re.I)


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lines, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            t = " ".join(data.split())
            if t:
                self.lines.append(t)


def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.8,ko;q=0.6"})
    try:
        with urllib.request.urlopen(req, timeout=30, context=LOOSE_TLS) as r:
            return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")
    except Exception:
        # Some .go.kr servers only answer curl (TLS quirks) — same fallback as the link check.
        out = subprocess.run(["curl", "-sSkL", "--max-time", "30", "-A", "Mozilla/5.0", url], capture_output=True, check=True)
        return out.stdout.decode("utf-8", "replace")


def fetch(url):
    p = Text()
    p.feed(html.unescape(download(url)))
    seen, out, skip_next = set(), [], False
    for line in p.lines:
        if skip_next:
            skip_next = False
            continue
        if TODAY.search(line):
            skip_next = True
            continue
        if KEEP.search(line) and len(line) < 400 and line not in seen:
            seen.add(line)
            out.append(line)
    return out


def targets():
    items = json.loads((DATA / "places.json").read_text())["items"]
    urls = {}
    for it in items:
        for s in it.get("sources") or []:
            if any(w in s.get("field", "").lower() for w in FIELD_WORDS) and not SKIP_URL.search(s["url"]):
                urls.setdefault(s["url"], []).append(it["id"])
    return urls


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", default=".watch", help="folder that keeps yesterday's snapshots")
    args = ap.parse_args()
    state = pathlib.Path(args.state)
    state.mkdir(parents=True, exist_ok=True)

    urls = targets()
    with ThreadPoolExecutor(8) as ex:
        results = dict(zip(urls, ex.map(lambda u: _safe(fetch, u), urls)))

    changed, failed, new = [], [], 0
    for url, lines in results.items():
        snap = state / (hashlib.sha1(url.encode()).hexdigest()[:16] + ".txt")
        if isinstance(lines, Exception):
            failed.append((url, type(lines).__name__))
            continue
        if not lines:
            failed.append((url, "no hours text found"))
            continue
        if not snap.exists():
            new += 1
        else:
            before = snap.read_text().splitlines()
            if before != lines:
                diff = [d for d in difflib.unified_diff(before, lines, lineterm="", n=0) if d[:1] in "+-" and d[:3] not in ("+++", "---")]
                changed.append((url, diff))
        snap.write_text("\n".join(lines))

    REPORTS.mkdir(exist_ok=True)
    out = ["# Official hours pages — daily watch", ""]
    out.append(f"Pages watched: {len(urls)} · changed: {len(changed)} · first snapshot: {new} · could not read: {len(failed)}")
    for url, diff in changed:
        out += ["", f"## Changed — {', '.join(sorted(set(urls[url])))}", url, "", "```diff", *diff[:60], "```"]
    if failed:
        out += ["", "## Could not read (check by hand if it repeats)"]
        out += [f"- {u} — {why}" for u, why in failed]
    (REPORTS / "place-watch.md").write_text("\n".join(out) + "\n")
    print(out[2])
    for url, _ in changed:
        print("CHANGED", ", ".join(urls[url]), url)
    sys.exit(1 if changed else 0)


def _safe(fn, arg):
    try:
        return fn(arg)
    except Exception as e:  # one slow government site must not stop the rest
        return e


if __name__ == "__main__":
    main()
