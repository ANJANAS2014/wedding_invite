# Project structure — where things live

All images and media now live in **one tree** under `public/`, grouped by where
they're used. There are **no copies** anywhere — every file exists exactly once.

```
public/
├── images/
│   ├── cover/         Cover page art (garland, procession, couple cutout)
│   ├── backgrounds/   Full-bleed section backgrounds
│   ├── gallery/       Two lotus photos used by the "Our Story" cards (p4, p7)
│   ├── couple/        Bride & groom portraits (couple + story photos)
│   ├── venues/        Wedding & reception venue photos
├── audio/             background-music.mp3
└── icons/             favicon.svg

src/assets/filmstrip/  Filmstrip + lightbox photos (auto-loaded) + captions.json
```

## Where each folder is referenced

| Folder | Referenced by |
|---|---|
| `images/cover/` | `src/styles/variables.css` (`--wT`, `--cover-*` vars), `index.html` preloads, `WEDDING_IMAGES.hero_cover` |
| `images/backgrounds/` | `src/styles/variables.css` (`--b1`, `--b2`, `--b3`) |
| `images/gallery/` | `src/data/weddingData.ts` (`WEDDING_IMAGES` p4, p7) → Story cards |
| `src/assets/filmstrip/` | `src/data/filmstrip.ts` (auto-scan) → filmstrip, lightbox |
| `images/couple/` | `weddingData.ts` (p10, p12, story_photo_one–four), `CoupleSection.tsx`. `groom-studio-portrait.jpg` is currently not displayed anywhere. |
| `images/venues/` | `weddingData.ts` (w1, r1) → `src/data/events.ts` → `EventsSection` |
| `audio/` | `src/components/MusicPlayer/MusicPlayer.tsx` |
| `icons/` | `index.html` favicon |

## How to edit a photo

1. Find it in `public/images/<section>/` (names are self-describing).
2. Edit it in place with your photo editor — keep the filename.
3. Refresh the dev server (`npm run dev`) or rebuild. Done — no path changes needed.

## How to add a photo to the filmstrip

The filmstrip and lightbox show **every image in `src/assets/filmstrip/`**. No code changes needed.

1. Drop the photo into `src/assets/filmstrip/` (jpg, jpeg, png, webp or avif).
2. Start its name with a number to set its position, e.g. `14-mehendi-night.jpg`.
   Files are sorted by name, number-aware (`9-…` comes before `10-…`).
3. Optional: add a line to `src/assets/filmstrip/captions.json` for its alt text:
   `"14-mehendi-night.jpg": "Lalith and Anjana at the mehendi night"`.
   Without it, the alt text comes from the file name ("Mehendi night").
4. Commit and push (or run `npm run dev` locally). The list is built at build time.

To remove a photo, delete it from the folder (and its `captions.json` line).
Landscape vs portrait cropping is detected automatically.
Keep photos under ~500 KB; `13-choosing-each-other.png` (2.4 MB) is worth shrinking.

The "Our Story" cards keep their own copies in `public/images/couple/` and
`public/images/gallery/`, so changing the filmstrip never affects them.

## The old `filmstrip-photos/` folder is gone

It used to hold duplicate copies for editing. All those photos now live here:
`public/images/gallery/` (the 11 gallery/story shots) and `public/images/couple/`
(the 4 `couple_photo_*` shots). Edit them in place.
