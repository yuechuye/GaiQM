#!/usr/bin/env python3
"""爬取 g.aitags.cn 的三角洲改枪码数据"""

import re
import json
import urllib.request
import time
import sys

BASE_URL = "https://g.aitags.cn"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode("utf-8")
        except Exception as e:
            if i < retries - 1:
                time.sleep(2)
    return None

def get_weapon_slugs():
    print("Fetching weapon list...", file=sys.stderr)
    html = fetch(f"{BASE_URL}/delta-force-code")
    if not html:
        return []
    slugs = re.findall(r'href="https?://g\.aitags\.cn/weapons/([^/"]+)"', html)
    seen = set()
    unique = []
    for s in slugs:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    print(f"  Found {len(unique)} weapons", file=sys.stderr)
    return unique

def extract_codes(html):
    codes = []
    rows = re.findall(
        r'<tr[^>]*data-code="([^"]*)"[^>]*>(.*?)</tr>',
        html, re.DOTALL
    )
    for code, row_html in rows:
        if 'image-row' in row_html:
            continue

        # Description
        desc_match = re.search(r'<div[^>]*title="([^"]*)"', row_html)
        if desc_match:
            description = desc_match.group(1).strip()
        else:
            desc_match = re.search(r'<div[^>]*>([^<]+)</div>', row_html)
            description = desc_match.group(1).strip() if desc_match else ""

        # Value
        td_contents = re.findall(r'<td[^>]*>([^<]*)</td>', row_html)
        value = 0
        for td in td_contents:
            td = td.strip()
            if re.match(r'\d+(\.\d+)?[WK]?$', td, re.IGNORECASE):
                val_str = td.upper()
                if 'W' in val_str:
                    value = int(float(val_str.replace('W', '')) * 10000)
                elif 'K' in val_str:
                    value = int(float(val_str.replace('K', '')) * 1000)
                else:
                    value = int(float(val_str))
                break

        codes.append({
            "code": code.strip(),
            "description": description,
            "value": value
        })
    return codes

def main():
    slugs = get_weapon_slugs()
    if not slugs:
        sys.exit(1)

    guns = []
    for i, slug in enumerate(slugs):
        print(f"[{i+1}/{len(slugs)}] {slug}...", file=sys.stderr)
        html = fetch(f"{BASE_URL}/weapons/{slug}")
        if not html:
            print(f"  SKIP (fetch failed)", file=sys.stderr)
            continue

        title_match = re.search(r'<title>([^<]*)</title>', html)
        name = title_match.group(1).strip() if title_match else slug.upper()
        # Clean up name - remove site suffix
        name = re.sub(r'\s*[-–|_]\s*三角洲改枪码大全.*$', '', name)
        name = name.replace('改枪码大全_三角洲行动', '').strip()

        codes = extract_codes(html)
        print(f"  {len(codes)} codes", file=sys.stderr)
        if codes:
            guns.append({"name": name, "codes": codes})
        time.sleep(0.3)

    print(json.dumps({"guns": guns}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
