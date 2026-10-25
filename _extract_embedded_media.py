import base64
import json
import re
from pathlib import Path

root = Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

img_match = re.search(r"const IMG=(\{.*?\});", html)
if not img_match:
    raise SystemExit("Could not find const IMG")

# The object uses quoted keys and JSON-compatible data/image strings.
assets = json.loads(img_match.group(1))
(root / "assets" / "images").mkdir(parents=True, exist_ok=True)
(root / "assets" / "audio").mkdir(parents=True, exist_ok=True)

names = {
    "hero_portrait": "p6",
    "portrait_groom": "gImg_placeholder",
}
print(f"Embedded image entries: {len(assets)}")
for key, data_uri in assets.items():
    match = re.fullmatch(r"data:image/(\w+);base64,(.+)", data_uri, re.S)
    if not match:
        print(f"Skipping {key}: unsupported format")
        continue
    subtype, payload = match.groups()
    extension = "jpg" if subtype == "jpeg" else subtype
    output = root / "assets" / "images" / f"photo-{key}.{extension}"
    output.write_bytes(base64.b64decode(payload))
    print(f"{key}: {output.name} ({output.stat().st_size} bytes)")

bgm_match = re.search(r"const BGM='(data:audio/[^']+;base64,([^']+))'", html)
if bgm_match:
    payload = bgm_match.group(2)
    output = root / "assets" / "audio" / "background-music.mp3"
    output.write_bytes(base64.b64decode(payload))
    print(f"audio: {output.name} ({output.stat().st_size} bytes)")
else:
    print("Embedded audio not found (the site may synthesize music).")
