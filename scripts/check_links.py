#!/usr/bin/env python3
"""Check every official link and freshness in data/*.json.

Usage: python3 scripts/check_links.py [--max-age DAYS]
Writes a Markdown report to reports/links-YYYY-MM-DD.md and prints a summary.
Exit code 1 if any link is broken, so it can run on a daily schedule.
"""
import argparse
import datetime as dt
import json
import pathlib
import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = next((d for d in (ROOT / "data", ROOT / "src" / "data") if d.is_dir()), ROOT / "data")
REPORTS = ROOT / "reports"
URL_FIELDS = ("url", "official_url_en", "official_url_ko", "booking_url")
UA = "Mozilla/5.0 (link-check; foreigner-guide)"
# Many .go.kr sites have incomplete certificate chains; we still want to know they respond.
LOOSE_TLS = ssl.create_default_context()
LOOSE_TLS.check_hostname = False
LOOSE_TLS.verify_mode = ssl.CERT_NONE


def collect(items):
    """Yield (item_id, field, url) for every URL in the dataset."""
    for it in items:
        for f in URL_FIELDS:
            if it.get(f):
                yield it["id"], f, it[f]
        for s in it.get("sources") or []:
            if s.get("url"):
                yield it["id"], f"source:{s.get('field', '?')}", s["url"]


def host(url):
    return urlparse(url).netloc.lower().removeprefix("www.").split(":")[0]


def check(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*", "Accept-Language": "en-US,en;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=25, context=LOOSE_TLS) as r:
            final = r.geturl()
            moved = host(final) != host(url)
            return r.status, final, moved, None
    except urllib.error.HTTPError as e:
        if e.code < 500:
            return e.code, url, False, str(e.reason)
        return curl_check(url) or (e.code, url, False, str(e.reason))
    except Exception as e:  # timeout, DNS, TLS quirks of some .go.kr servers
        return curl_check(url) or (None, url, False, type(e).__name__)


def curl_check(url):
    """Second opinion: curl handles some legacy TLS setups urllib rejects."""
    try:
        out = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-L", "-k", "-m", "30", "-A", UA, "-H", "Accept: text/html,*/*",
             "-w", "%{http_code} %{url_effective}", url],
            capture_output=True, text=True, timeout=40).stdout.split(" ", 1)
        code, final = int(out[0]), out[1]
    except Exception:
        return None
    if code == 0:
        return None
    return code, final, host(final) != host(url), None if code < 400 else f"curl {code}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-age", type=int, default=30, help="days before last_verified counts as stale")
    args = ap.parse_args()

    items = []
    for p in sorted(DATA.glob("*.json")):
        d = json.loads(p.read_text())
        # Supports a bare list, or {"items": [...]} (korea-linkhub format)
        items += d if isinstance(d, list) else d.get("items", [])
    today = dt.date.today()

    links = list(dict.fromkeys(collect(items)))
    unique = sorted({u for _, _, u in links})
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = dict(zip(unique, ex.map(check, unique)))

    broken, moved = [], []
    for item_id, field, url in links:
        status, final, host_changed, err = results[url]
        if status is None or status >= 400:
            broken.append((item_id, field, url, status or err))
        elif host_changed:
            moved.append((item_id, field, url, final))

    stale, weak = [], []
    for it in items:
        lv = it.get("last_verified") or it.get("verifiedAt")
        age = (today - dt.date.fromisoformat(lv)).days if lv else None
        if age is None or age > args.max_age:
            stale.append((it["id"], lv or "never"))
        if "confidence" in it and it["confidence"] != "verified":
            weak.append((it["id"], it.get("confidence"), (it.get("notes") or "")[:120]))

    REPORTS.mkdir(exist_ok=True)
    out = REPORTS / f"links-{today.isoformat()}.md"
    lines = [f"# Link & freshness check — {today}", "",
             f"Items {len(items)} · unique links {len(unique)} · broken {len(broken)} · "
             f"moved to another site {len(moved)} · stale {len(stale)} · not fully verified {len(weak)}", ""]

    def table(title, head, rows):
        lines.extend([f"## {title}", ""])
        if not rows:
            lines.extend(["None.", ""])
            return
        lines.append("| " + " | ".join(head) + " |")
        lines.append("|" + "---|" * len(head))
        lines.extend("| " + " | ".join(str(c) for c in r) + " |" for r in rows)
        lines.append("")

    table("Broken links (fix first)", ["item", "field", "url", "status"], broken)
    table("Moved to another site (check the new page is the same)", ["item", "field", "url", "now"], moved)
    table(f"Stale (last verified > {args.max_age} days)", ["item", "last verified"], stale)
    table("Not fully verified", ["item", "confidence", "notes"], weak)
    out.write_text("\n".join(lines))

    print(lines[2])
    print(f"Report: {out.relative_to(ROOT)}")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
