from pathlib import Path

t = Path("index.html").read_text(encoding="utf-8", errors="replace")

# Find RSVP state around T("yes")
idx = t.find('T("yes")')
print("T yes at", idx)
# find useState for F nearby in $K function
start = t.rfind("function $K", 0, idx)
print("$K at", start)
print(t[start:start+2500])
print("\n\n===== around T= =====")
# search T= in the component
chunk = t[start:idx]
# last occurrences of ,T=
for token in [",T=", "T=tA.useState", "F=tA.useState", "useState(null", "useState("]:
    print(token, chunk.rfind(token) if start>=0 else -1)

print("\n===== F state =====")
fpos = t.find("F,T]=tA.useState")
print("F,T", fpos)
if fpos < 0:
    fpos = t.find("[F,T]")
    print("[F,T]", t.find("[F,T]="), t[t.find("F,T")-80:t.find("F,T")+200] if t.find("F,T")>0 else "")
# try more patterns
import re
for m in re.finditer(r".{0,40}F.{0,5}T.{0,40}useState.{0,40}", t[start:idx] if start>0 else t[:5000]):
    print(m.group())
    break

# search useState near T("yes")
near = t[idx-8000:idx]
print("\n===== last 8k before T(yes) useStates =====")
for m in re.finditer(r"tA\.useState\([^)]{0,40}\)", near):
    print(m.start(), m.group(), near[max(0,m.start()-50):m.start()+80])
