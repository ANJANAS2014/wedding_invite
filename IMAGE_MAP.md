# Project structure — where things live

All images and media now live in **one tree** under `public/`, grouped by where
they're used. There are **no copies** anywhere — every file exists exactly once.

```
public/
├── images/
│   ├── cover/         Cover page art (garland, procession, couple cutout)
│   ├── backgrounds/   Full-bleed section backgrounds
│   ├── gallery/       Filmstrip / lightbox / gallery photos
│   ├── couple/        Bride & groom portraits (couple + story photos)
│   ├── venues/        Wedding & reception venue photos
│   └── _unused/       Files not referenced anywhere — delete when ready
├── audio/             background-music.mp3
└── icons/             favicon.svg
```

## Where each folder is referenced

| Folder | Referenced by |
|---|---|
| `images/cover/` | `src/styles/invitation.css` (`--wT`, `--cover-*` vars), `index.html` preloads, `WEDDING_IMAGES` |
| `images/backgrounds/` | `src/styles/invitation.css` (`--b1`, `--b2`, `--b3`) |
| `images/gallery/` | `src/data/weddingData.ts` (`WEDDING_IMAGES` p1–p9, p13–p14), filmstrip, lightbox |
| `images/couple/` | `weddingData.ts` (p10–p12, story_photo_one–four), `CoupleSection.tsx` |
| `images/venues/` | `weddingData.ts` (w1, r1), `EventsSection` |
| `audio/` | `src/components/MusicPlayer.tsx` |
| `icons/` | `index.html` favicon |

## How to edit a photo

1. Find it in `public/images/<section>/` (names are self-describing).
2. Edit it in place with your photo editor — keep the filename.
3. Refresh the dev server (`npm run dev`) or rebuild. Done — no path changes needed.

## How to add a photo to the filmstrip

The filmstrip renders every entry of `UNIFIED_MEMORIES` in `src/data/weddingData.ts`.
Put your photo in `public/images/gallery/`, then add a line to `WEDDING_IMAGES` and
one entry to `WEDDING_GALLERY` (or `REELS_PHOTOS`) with a caption. There is no
folder-scan magic anymore — everything is explicit and one-line editable.

## The old `filmstrip-photos/` folder is gone

It used to hold duplicate copies for editing. All those photos now live here:
`public/images/gallery/` (the 11 gallery/story shots) and `public/images/couple/`
(the 4 `couple_photo_*` shots). Edit them in place.
