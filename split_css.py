import re, os
src = "src/styles/invitation.css"
out = "src/styles/sections"
os.makedirs(out, exist_ok=True)
lines = open(src, encoding="utf-8").read().splitlines(keepends=True)
chunks = []
cur = []
for ln in lines:
    if ln.startswith("/* ====") and cur:
        chunks.append(cur); cur = [ln]
    else:
        cur.append(ln)
if cur: chunks.append(cur)
for i, c in enumerate(chunks):
    # derive name from first comment line
    name = "section_%d" % i
    for ln in c[:5]:
        m = re.search(r"/\*\s*(.+?)\s*\*/", ln)
        if m:
            slug = re.sub(r"[^a-zA-Z0-9]+", "_", m.group(1)).strip("_").lower()[:40]
            if slug: name = slug; break
    path = os.path.join(out, name + ".css")
    # avoid collisions
    j = 1
    while os.path.exists(path):
        path = os.path.join(out, "%s_%d.css" % (name, j)); j += 1
    open(path, "w", encoding="utf-8").write("".join(c))
print("wrote", len(chunks), "files to", out)
