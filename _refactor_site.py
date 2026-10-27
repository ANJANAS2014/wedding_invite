import re
from pathlib import Path

root = Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")

style_match = re.search(r"<style>(.*)</style>", html, re.S)
script_match = re.search(r"<script>(.*)</script>", html, re.S)
if not style_match or not script_match:
    raise SystemExit("Expected inline style and script blocks")
css = style_match.group(1).strip()
script = script_match.group(1).strip()

css_dir = root / "css"
css_dir.mkdir(exist_ok=True)
(css_dir / "base.css").write_text(css, encoding="utf-8")
(css_dir / "layout.css").write_text("/* Section layout and shared structure. Base styles are in base.css. */\n", encoding="utf-8")
(css_dir / "components.css").write_text("/* Hero, cards, forms, gallery, editor, and controls. */\n", encoding="utf-8")
(css_dir / "animations.css").write_text("/* Motion remains in base.css during this static-site migration. */\n", encoding="utf-8")
(css_dir / "responsive.css").write_text("/* Responsive overrides remain in base.css during this static-site migration. */\n", encoding="utf-8")

img_match = re.search(r"const IMG=(\{.*?\});", script)
if not img_match:
    raise SystemExit("Image object not found")
images = re.findall(r'"(p[0-9]+w?|w1|r1)":"data:image/[^"]+', img_match.group(1))
image_manifest = {
    key: f"assets/images/photo-{key}.jpg" for key in images
}
script = script.replace(img_match.group(0), "const IMG=window.WEDDING_IMAGES;", 1)

script = re.sub(r"const BGM='data:audio/mpeg;base64,[^']+'", "const BGM='assets/audio/background-music.mp3'", script)

# Extract editable defaults so the application content remains unchanged.
def_start = script.find("const DEF=")
def_end_marker = "};\nlet D="
def_end = script.find(def_end_marker, def_start)
if def_start < 0 or def_end < 0:
    raise SystemExit("Default content object not found")
def_object = script[def_start + len("const DEF="):def_end + 1]
def_object = re.sub(r"PRE\[(\d+)\]\[(\d+)\]", lambda m: [
    ['#6b1a24', '#f8efdc', '#c19a3d', 'Cormorant Garamond', 'Jost'],
    ['#8b1a1a', '#fff4e0', '#c9a24a', 'Cinzel', 'Lora'],
    ['#0f4c4a', '#f6efe0', '#d4af37', 'Playfair Display', 'Jost'],
    ['#7a2e4a', '#fdf2ec', '#c8963e', 'Great Vibes', 'Cormorant Garamond'],
][int(m.group(1))][int(m.group(2)) - 1], def_object)
script = script.replace("const DEF=" + def_object + "\nlet D=", "const DEF=Object.assign({},window.WEDDING_CONTENT||{});let D=", 1)

# Keep editor preset constants available to the existing application.
script = re.sub(r"^const PRE=.*$", "const PRE=window.WEDDING_PRESETS;", script, flags=re.M)
script = re.sub(r"^const FH=.*$", "const FH=window.WEDDING_FONTS.heading;", script, flags=re.M)
script = re.sub(r"^const FB=.*$", "const FB=window.WEDDING_FONTS.body;", script, flags=re.M)

(root / "js").mkdir(exist_ok=True)
(root / "js" / "main.js").write_text(script, encoding="utf-8")

(root / "data").mkdir(exist_ok=True)
(root / "data" / "theme.js").write_text("""window.WEDDING_PRESETS = [
  ['Maroon & Gold', '#6b1a24', '#f8efdc', '#c19a3d', 'Cormorant Garamond', 'Jost'],
  ['Temple Red', '#8b1a1a', '#fff4e0', '#c9a24a', 'Cinzel', 'Lora'],
  ['Peacock', '#0f4c4a', '#f6efe0', '#d4af37', 'Playfair Display', 'Jost'],
  ['Rose Romance', '#7a2e4a', '#fdf2ec', '#c8963e', 'Great Vibes', 'Cormorant Garamond']
];
window.WEDDING_FONTS = {
  heading: ['Cormorant Garamond', 'Playfair Display', 'Cinzel', 'Great Vibes', 'Marcellus'],
  body: ['Jost', 'Lora', 'Cormorant Garamond', 'Marcellus']
};
""", encoding="utf-8")

(root / "data" / "images.js").write_text("window.WEDDING_IMAGES = " + __import__('json').dumps(image_manifest, indent=2) + ";\n", encoding="utf-8")
(root / "data" / "content.js").write_text("window.WEDDING_CONTENT = " + def_object + ";\n", encoding="utf-8")

# Preserve behavior modules as explicitly organized entry points; main.js owns the existing renderer.
(root / "js" / "countdown.js").write_text("// Countdown behavior is initialized by main.js.\n", encoding="utf-8")
(root / "js" / "music.js").write_text("// Music behavior is initialized by main.js.\n", encoding="utf-8")
(root / "js" / "editor.js").write_text("// Customization behavior is initialized by main.js.\n", encoding="utf-8")
(root / "js" / "rsvp.js").write_text("// RSVP behavior is initialized by main.js.\n", encoding="utf-8")

(root / "index.html").write_text("""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#ebe2db">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Lalith &amp; Anjana · Wedding Invitation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&amp;family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&amp;family=Great+Vibes&amp;family=Jost:wght@300;400;500&amp;family=Lora:ital@0;1&amp;family=Marcellus&amp;family=Playfair+Display:ital@0;1&amp;display=swap">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
  <div id="app"></div>
  <div id="lb"><img alt="Wedding memory" decoding="async"></div>
  <button id="mu" aria-label="Mute or unmute music"><i></i><i></i><i></i><i></i></button>
  <script src="data/theme.js"></script>
  <script src="data/images.js"></script>
  <script src="data/content.js"></script>
  <script src="js/main.js" defer></script>
  <script src="js/countdown.js" defer></script>
  <script src="js/music.js" defer></script>
  <script src="js/editor.js" defer></script>
  <script src="js/rsvp.js" defer></script>
</body>
</html>
""", encoding="utf-8")

print("Refactor complete")
print(f"Images: {len(image_manifest)}, CSS: {len(css)} chars, JS: {len(script)} chars")
