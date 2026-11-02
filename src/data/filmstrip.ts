/**
 * Filmstrip photos are picked up automatically from src/assets/filmstrip/.
 *
 *  - Add a photo:    drop it in that folder (jpg, jpeg, png, webp, avif).
 *  - Order:          by file name, number-aware (01-…, 02-…, 10-…).
 *  - Alt text:       from captions.json in the same folder, keyed by file name;
 *                    if a photo isn't listed, it's derived from the file name
 *                    ("14-mehendi-night.jpg" → "Mehendi night").
 *  - Remove a photo: take it out of the folder (and its line in captions.json).
 *
 * The list is built when the site is built, so redeploy after changing photos.
 */

export interface UnifiedMemoryPhoto {
  src: string;
  alt: string;
}

const photoFiles = import.meta.glob<string>(
  '../assets/filmstrip/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true, query: '?url', import: 'default' }
);

// Optional — the site still builds if captions.json is missing.
const captionFiles = import.meta.glob<Record<string, string>>(
  '../assets/filmstrip/captions.json',
  { eager: true, import: 'default' }
);
const captions: Record<string, string> = Object.values(captionFiles)[0] ?? {};

const fileName = (path: string) => path.split('/').pop() ?? path;

const altFromFileName = (name: string) => {
  const words = name
    .replace(/\.[^.]+$/, '')     // extension
    .replace(/^\d+[-_ .]*/, '')  // leading order number
    .replace(/[-_]+/g, ' ')
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Wedding memory';
};

export const UNIFIED_MEMORIES: UnifiedMemoryPhoto[] = Object.entries(photoFiles)
  .map(([path, src]) => ({ name: fileName(path), src }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
  .map(({ name, src }) => ({ src, alt: captions[name] ?? altFromFileName(name) }));
