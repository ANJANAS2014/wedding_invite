# Wedding Invitation

A static, no-build wedding invitation for Lalith and Anjana. The original design, animations, countdown, music, gallery, editor, map links, and RSVP behavior are preserved in the refactored files.

## Project structure

```text
index.html
css/
  base.css
  layout.css
  components.css
  animations.css
  responsive.css
js/
  main.js
  gallery.js
  countdown.js
  music.js
  editor.js
  rsvp.js
netlify/
  functions/
    rsvp.js
apps-script/
  Code.gs
data/
  content.js
  theme.js
  images.js
assets/
  images/
  audio/
  icons/
```

## Preview locally

Serve this folder with any static server, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`. Opening `index.html` directly also works for most content and image features, but HTTP serving is best for audio and browser testing.

## Edit text, dates, and venues

Edit `data/content.js` for names, invitation copy, story, family text, dates, venues, addresses, map URLs, RSVP details, and image keys. Theme defaults also remain connected to `data/theme.js`.

The current hero is controlled by `cover`, which defaults to `p2`. `cover`, `gImg`, `bImg`, and the `sp` and `gal` arrays map the existing section photos. Preserve the original date format, for example `2026-11-29T08:00`, and time format, for example `09:20`.

## Replace photos

Place replacement images in `assets/images/`, then change the matching path in `data/images.js`. Existing section mappings are also documented in that file:

- Hero cover/first screen: `cover`, default key `p2`; also `hero_cover` in the image manifest
- Hero decorative background: `p18`, `p18w`, and `p19`
- Couple portraits: `gImg` (`p12`) and `bImg` (`p10`)
- Story photos: `sp` (`p13`, `p14`)
- Couple/story background: `p15`, `p16`, `p17`
- Gallery: `gal`, preserving order
- Wedding/reception venue photos: `w1` and `r1`

Replace a file in place, preserving its filename, to update the page without editing JavaScript. Do not upscale small originals unnecessarily. Prefer JPEG/WebP output with dimensions appropriate to its rendered size.

## Edit colors and fonts

Edit `data/theme.js` and the color/font values in `data/content.js`. `maroon`, `cream`, and `gold` control the core palette. Heading and body fonts must also be loaded in the Google Fonts stylesheet in `index.html` before they can be used.

## Replace music

Replace `assets/audio/background-music.mp3` with your MP3, keeping the filename, or update the `BGM` assignment in `js/main.js`. Browsers may block autoplay; the existing first-interaction and music controls remain enabled.

## RSVP setup (Google Sheets + Apps Script)

The RSVP page sends requests to a same-origin Netlify Function. That function calls the Apps Script Web App server-to-server, verifies its JSON response, and returns only the aggregate confirmed guest count. Individual names, emails, attendance choices, and wishes are never returned to the website. The Sheet must remain private; do not publish it or put its URL, ID, or shared secret in frontend files.

1. Create a Google Sheet in your account and keep its sharing restricted to you and trusted administrators. Copy the spreadsheet ID from its URL (`/spreadsheets/d/SPREADSHEET_ID/edit`).
2. Open **Extensions → Apps Script** from the Sheet. Replace the script contents with [`apps-script/Code.gs`](./apps-script/Code.gs) and save. The script creates a `Responses` tab and header row on first use. Columns are timestamp, submission ID, guest name, email, attendance, guest count, and wishes.
3. In Apps Script **Project Settings → Script properties**, add:
   - `RSVP_SPREADSHEET_ID` — the ID copied in step 1
   - `RSVP_SHEET_NAME` — `Responses` (or your preferred tab name)
   - `RSVP_SHARED_SECRET` — a random secret of at least 32 characters

   To generate a 32-byte secret in Windows PowerShell:

   ```powershell
   $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
   $bytes = New-Object byte[] 32
   $rng.GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   $rng.Dispose()
   ```

4. In Apps Script, choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone**, then deploy and authorize the requested Sheet access. This makes the script endpoint reachable, not the spreadsheet; the shared secret is required for requests. If your Google Workspace administrator disables public web apps, use an account where this deployment option is permitted. Copy the resulting `/exec` URL.
5. In Netlify **Site configuration → Environment variables**, set `APPS_SCRIPT_URL` to that web app `/exec` URL and `RSVP_SHARED_SECRET` to the same secret used in step 3. Make both available to **Functions** and the deploy contexts you use. Keep them server-side; do not add them to `js/main.js`, `data/content.js`, or any other published file.
6. Deploy/redeploy the site from GitHub. Netlify detects `netlify/functions/rsvp.js`; keep the existing empty build command and publish directory `.`.
7. Confirm `https://YOUR_SITE/.netlify/functions/rsvp` returns JSON containing only `ok` and `totalConfirmed`. Submit test attending and wishes-only responses, check their rows in the private Sheet, then remove test rows if desired. Attending responses contribute their guest count; declined and wishes-only responses contribute zero.

The form accepts 1–10 attending guests. Email is optional. A request ID and Apps Script lock prevent duplicate rows when the same submission is retried. The page reports success only after the function confirms that the row was saved (or was already saved) and supplies the aggregate total. With the plain Python static preview, the function is unavailable, so RSVP submission will report failure rather than pretend to save.

The on-page customization editor remains available through the gear button.

## Netlify deployment

1. Commit and push the project to GitHub.
2. In Netlify, create a site from that repository.
3. Use an empty build command and publish directory `.` (the repository root).
4. Add the RSVP environment variables above and deploy. No frontend build command or package install is required.

## Verification

Run `python _validate_project.py` to check module and asset references. Run `python _extract_embedded_media.py` only when deliberately re-extracting source media from the legacy monolith; it is an archival utility, not a build step.
