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

## RSVP and customization

Set `SHEET_URL` in `js/main.js` to an Apps Script Web App URL to use sheet submission. With the default empty URL, the existing `email`/`wa` contact behavior remains active. The on-page customization editor remains available through the gear button.

## Netlify deployment

1. Commit and push the project to GitHub.
2. In Netlify, create a site from that repository.
3. Use an empty build command and publish directory `.` (the repository root).
4. Deploy. No environment variables or build packages are required.

## Verification

Run `python _validate_project.py` to check module and asset references. Run `python _extract_embedded_media.py` only when deliberately re-extracting source media from the legacy monolith; it is an archival utility, not a build step.

