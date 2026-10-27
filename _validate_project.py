import re
from pathlib import Path

root = Path(__file__).parent
files = [
    "js/main.js", "data/content.js", "data/images.js", "data/theme.js",
    "js/countdown.js", "js/music.js", "js/editor.js", "js/rsvp.js"
]
missing = []
for name in files:
    path = root / name
    print(f"{name}: {path.stat().st_size} bytes")
    text = path.read_text(encoding="utf-8")
    for asset in re.findall(r'["\'](assets/[A-Za-z0-9_./-]+)["\']', text):
        if not (root / asset).exists():
            missing.append((name, asset))

print("Missing assets:", missing)
index = (root / "index.html").read_text(encoding="utf-8")
print("Embedded media in index:", bool(re.search(r"base64|data:image|data:audio", index)))
print("Index bytes:", len(index.encode("utf-8")))

imported = re.findall(r'(?:href|src)="([^"]+)"', index)
for reference in imported:
    if reference.startswith(("http://", "https://", "#")):
        continue
    if not (root / reference).exists():
        missing.append(("index.html", reference))
print("Missing imports:", missing)
raise SystemExit(1 if missing else 0)
