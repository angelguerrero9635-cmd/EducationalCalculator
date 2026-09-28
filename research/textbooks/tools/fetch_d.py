"""Polite cached fetcher for research group d (science TOCs and practice questions).

Usage: python3 fetch_d.py URL [--delay SECONDS]  -> prints the cache file path and metadata.
Every page is cached in the group's scratch folder so nothing is fetched twice; one request
per second per host by default (pass a larger --delay for hosts with a Crawl-delay).
"""
import hashlib, os, sys, time, json, urllib.parse
import requests

UA = ("EducationalCalculatorResearch/0.2 (offline study-app curriculum research; "
      "contact angel.guerrero9635@gmail.com)")
CACHE = os.environ.get("TB_D_CACHE", "/tmp/claude-0/-home-user-EducationalCalculator/"
                       "b3dae256-82c0-5711-ad65-40b542496e7e/scratchpad/tb-d/cache")
STAMP = os.path.join(CACHE, "_last.json")  # last request time per host
CA = "/root/.ccr/ca-bundle.crt"


def fetch(url, delay=1.0):
    """Return the cache path for url, fetching it once (politely) if not cached."""
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest()[:16])
    if os.path.exists(path):
        return path
    host = urllib.parse.urlparse(url).netloc.removeprefix("www.")  # same server either way
    last = json.load(open(STAMP)) if os.path.exists(STAMP) else {}
    wait = last.get(host, 0) + delay - time.time()
    if wait > 0:
        time.sleep(wait)
    r = requests.get(url, headers={"User-Agent": UA}, timeout=90,
                     verify=CA if os.path.exists(CA) else True)
    last = json.load(open(STAMP)) if os.path.exists(STAMP) else {}  # re-read: other runs
    last[host] = time.time()
    json.dump(last, open(STAMP, "w"))
    if r.status_code == 429 or r.status_code >= 500:  # transient: never cache
        sys.stderr.write(f"HTTP {r.status_code} for {url}\n")
        path = path + ".err"
    with open(path, "wb") as f:
        f.write(r.content)
    with open(path + ".meta", "w") as f:
        json.dump({"url": url, "status": r.status_code, "final": r.url,
                   "type": r.headers.get("content-type")}, f)
    return path


def text(url, delay=1.0):
    return open(fetch(url, delay), encoding="utf-8", errors="replace").read()


if __name__ == "__main__":
    d = float(sys.argv[sys.argv.index("--delay") + 1]) if "--delay" in sys.argv else 1.0
    p = fetch(sys.argv[1], d)
    if "--cat" in sys.argv:  # print the cached body instead of its path
        print(open(p, encoding="utf-8", errors="replace").read())
    else:
        print(p, open(p + ".meta").read())
