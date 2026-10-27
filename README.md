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
- Story photos: `sp` (`story_photo_one` through `story_photo_four`), mapped to the four files in `resized_couple_photos/`
- Couple/story background: `p15`, `p16`, `p17`
- Gallery: `gal`, preserving order
- Wedding/reception venue photos: `w1` and `r1`

Replace a file in place, preserving its filename, to update the page without editing JavaScript. Do not upscale small originals unnecessarily. Prefer JPEG/WebP output with dimensions appropriate to its rendered size.

## Edit colors and fonts

Edit `data/theme.js` and the color/font values in `data/content.js`. `maroon`, `cream`, and `gold` control the core palette. Heading and body fonts must also be loaded in the Google Fonts stylesheet in `index.html` before they can be used.

## Replace music

Replace `assets/audio/background-music.mp3` with your MP3, keeping the filename, or update the `BGM` assignment in `js/main.js`. Browsers may block autoplay; the existing first-interaction and music controls remain enabled.

## RSVP setup (Google Sheets + Apps Script)

The RSVP page sends requests to a same-origin Netlify Function. That function calls the Apps Script Web App server-to-server, verifies its JSON response, and returns only aggregate wedding and reception guest totals. Individual names, emails, attendance choices, and wishes are never returned to the website. The Sheet must remain private; do not publish it or put its URL, ID, or shared secret in frontend files.

1. Create a Google Sheet in your account and keep its sharing restricted to you and trusted administrators. Copy the spreadsheet ID from its URL (`/spreadsheets/d/SPREADSHEET_ID/edit`).
2. Open **Extensions → Apps Script** from the Sheet. Replace the script contents with [`apps-script/Code.gs`](./apps-script/Code.gs) and save. The script creates a `Responses` tab and header row on first use. It retains the existing timestamp, submission ID, guest name, email, attendance, guest count, and wishes columns, then appends wedding attendance/count, reception attendance/count, public photo URL, photo metadata, and wish approval columns. On an existing sheet, it checks the legacy headers and appends missing columns without clearing or rewriting historical rows. Older attendance records have no event-specific meaning, so they remain preserved but are not included in either event total. If headers differ from the expected legacy schema, the service stops rather than guessing how to migrate them.
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
7. Confirm `https://YOUR_SITE/.netlify/functions/rsvp` returns aggregate fields `ok`, `weddingTotalConfirmed`, and `receptionTotalConfirmed` (plus a combined `totalConfirmed` for compatibility). Submit test attendance for either or both events, check the event-specific columns in the private Sheet, then remove test rows if desired.

The form accepts 1–10 guests separately for each event marked “We’ll be there!”; “Sending love” saves a guest count of zero. Wishes are optional. New submissions leave the legacy Email column blank; historical email values remain in the private sheet and are never returned by the public endpoint. A request ID and Apps Script lock prevent duplicate rows when the same submission is retried. The page reports success only after the function confirms that the row was saved (or was already saved) and supplies both aggregate totals. With the plain Python static preview, the functions are unavailable, so RSVP submission and public wishes will report unavailable rather than pretend to save or load.

### Optional photos and public wishes

Photo uploads are optional. They are currently unconfigured in this repository, so a selected photo is previewed but the RSVP still saves without it and says so. To enable uploads, create a Cloudinary unsigned upload preset restricted to JPG, PNG, and WebP, a 5 MB maximum, and a dedicated folder. Set the Cloudinary cloud name and that unsigned preset name in the `PHOTO_CLOUD_NAME` and `PHOTO_UPLOAD_PRESET` constants near the top of `js/main.js`. These values identify a public unsigned-upload configuration and are not API secrets; never put an API secret in frontend code. Restrict the preset because its name is visible to site visitors. The browser validates type/size before upload, Cloudinary validates the preset limits, and Apps Script accepts only HTTPS image URLs on `res.cloudinary.com`. Failed or unavailable uploads do not block an RSVP; the form reports that it was saved without a photo. Only the resulting URL and basic file metadata are stored in Sheets, never the image bytes.

Wishes are private by default. Review the private `Responses` sheet and enter exactly `APPROVED` in a row's **Wish approval** column to publish that guest name, wish, and (if present and valid) photo URL. Blank approval cells keep wishes hidden. Do not copy email addresses, RSVP choices, or guest counts into that column. The public `/.netlify/functions/wishes` endpoint returns only approved display names, wish text, and validated photo URLs; the Sheet must stay private. The endpoint is read-only and cached for one minute.

The RSVP function also checks the request origin, caps request bodies, validates server-side inputs, and uses a hidden honeypot field. There is no durable per-IP rate limiter configured in this static Netlify setup; Cloudinary preset restrictions are important for controlling upload abuse.

For the plain local preview at `http://127.0.0.1:8080`, the page uses clearly labeled demo data and browser-local storage because Python's static server does not run Netlify Functions. Sample approved wishes are in `data/demo-responses.json`, and [`data/Responses-demo.csv`](./data/Responses-demo.csv) is an editable spreadsheet-shaped sample using the same columns as the live Sheet. Local preview submissions stay in that browser only. Use **Download local RSVP spreadsheet (CSV)** on the form to export the sample rows plus local submissions; this file can be opened in Excel or imported into Google Sheets. This preview path is limited to localhost port 8080 and never sends demo submissions to the online RSVP endpoint.

After changing `apps-script/Code.gs`, update the existing Apps Script Web App deployment to a new version. Keep its existing URL and server-side shared-secret configuration.

The on-page customization editor remains available through the gear button.

## Netlify deployment

1. Commit and push the project to GitHub.
2. In Netlify, create a site from that repository.
3. Use an empty build command and publish directory `.` (the repository root).
4. Add the RSVP environment variables above and deploy. No frontend build command or package install is required.

## Verification

Run `node --test tests/*.test.js` for mocked RSVP, duplicate, privacy, and wishes approval checks. Run `python _validate_project.py` to check module and asset references. Run `python _extract_embedded_media.py` only when deliberately re-extracting source media from the legacy monolith; it is an archival utility, not a build step.
