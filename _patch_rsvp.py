from pathlib import Path

path = Path("index.html")
t = path.read_text(encoding="utf-8")

old_t = 'T=(x)=>{R(x),setTimeout(()=>{document.getElementById("details-section")?.scrollIntoView({behavior:"smooth"})},80)}'
new_t = (
    "T=(x)=>{R(x);"
    "try{let cfg=window.WEDDING_RSVP||{},url=String(cfg.formUrl||\"\").trim();"
    "if(url&&!/YOUR_|REPLACE|FORM_ID/i.test(url)){"
    "let u=new URL(url,location.href),guest=(a||K||\"\").trim();"
    "if(cfg.nameEntry&&guest)u.searchParams.set(cfg.nameEntry,guest);"
    "if(cfg.rsvpEntry)u.searchParams.set(cfg.rsvpEntry,x===\"yes\"?(cfg.yesValue||\"Yes\"):(cfg.noValue||\"No\"));"
    "window.open(u.toString(),\"_blank\",\"noopener,noreferrer\")"
    "}}catch(err){}"
    "setTimeout(()=>{document.getElementById(\"details-section\")?.scrollIntoView({behavior:\"smooth\"})},80)}"
)

if t.count(old_t) != 1:
    raise SystemExit(f"T handler count={t.count(old_t)}")
t = t.replace(old_t, new_t, 1)

old_copy = "Your response helps us plan seating and sadya with care."
new_copy = "Tap a choice to open a short Google RSVP form so we can plan seating and sadya with care."
if t.count(old_copy) != 1:
    raise SystemExit(f"copy count={t.count(old_copy)}")
t = t.replace(old_copy, new_copy, 1)

marker = '  <div id="root"></div>'
if t.count(marker) != 1:
    raise SystemExit("root marker missing")

config = '''  <div id="root"></div>
  <script>
    /* Paste your Google Form link below. Responses go to Google Sheets.
       1) forms.google.com → blank form
       2) Questions: Guest name, Attending (Yes / No), Number of guests, Events, Message
       3) Responses → Link to Sheets
       4) Send → copy the link into formUrl
       Optional: three dots → Get pre-filled link → fill a sample → copy entry.123 IDs into nameEntry / rsvpEntry
    */
    window.WEDDING_RSVP = {
      formUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",
      nameEntry: "entry.YOUR_NAME_FIELD",
      rsvpEntry: "entry.YOUR_RSVP_FIELD",
      yesValue: "Yes, I will attend",
      noValue: "No, I cannot attend"
    };
  </script>'''

t = t.replace(marker, config, 1)
path.write_text(t, encoding="utf-8")
print("patched ok")
