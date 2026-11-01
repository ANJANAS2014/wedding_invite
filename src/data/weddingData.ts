import type { Language } from '../types';

export interface GalleryPhoto {
  src: WeddingImageKey;
  alt: string;
  ratio: string;
  position?: string;
  caption?: string;
}

// Image paths are served from /public. Section backgrounds and cover art are
// referenced directly by CSS variables in src/styles/variables.css.
export const WEDDING_IMAGES = {
  p1: "/images/gallery/gallery-couple-doorway-portrait.jpg",
  p2: "/images/gallery/wedding-hero-couple-trees.jpg",
  p3: "/images/gallery/gallery-couple-white-wall-portrait.jpg",
  p4: "/images/gallery/gallery-couple-lotus-closeup-portrait.jpg",
  p5: "/images/gallery/gallery-couple-lotus-boat-landscape.jpg",
  p6: "/images/gallery/hero-couple-lotus-field.jpg",
  p7: "/images/gallery/gallery-couple-water-lotus-landscape.jpg",
  p8: "/images/gallery/gallery-couple-lotus-wide-landscape.jpg",
  p9: "/images/gallery/gallery-bride-lotus-landscape.jpg",
  p10: "/images/couple/bride-office-portrait.jpg",
  p12: "/images/couple/groom-park-portrait.jpg",
  w1: "/images/venues/wedding-venue-central-auditorium.jpg",
  r1: "/images/venues/reception-venue-annalakshmi.jpg",
  hero_cover: "/images/cover/wedding-couple-cutout-refined.webp",
  story_photo_one: "/images/couple/couple_photo_1.jpg",
  story_photo_two: "/images/couple/couple_photo_2.jpg",
  story_photo_three: "/images/couple/couple_photo_3.jpg",
  story_photo_four: "/images/couple/couple_photo_4.png",
} satisfies Record<string, string>;

export type WeddingImageKey = keyof typeof WEDDING_IMAGES;

export const WEDDING_GALLERY: GalleryPhoto[] = [
  { src: 'p7', alt: 'Lalith and Anjana among the lotus blooms', ratio: '3/2' },
  { src: 'p5', alt: 'A quiet moment together on the lotus lake', ratio: '3/2' },
  { src: 'p2', alt: 'Lalith and Anjana beneath the trees', ratio: '3/4' },
  { src: 'p8', alt: 'A wide view across the lotus garden', ratio: '3/2' },
  { src: 'p4', alt: 'A close portrait among the lotus flowers', ratio: '3/4' },
  { src: 'p1', alt: 'Lalith and Anjana sharing a moment in a doorway', ratio: '3/4' },
  { src: 'p3', alt: 'The couple together against a white wall', ratio: '3/4' },
  { src: 'p9', alt: 'Anjana among lotus flowers by the water', ratio: '3/2' },
  { src: 'p6', alt: 'The couple surrounded by the lotus field', ratio: '3/2' }
];

export interface ReelPhoto {
  src: string;
  caption: string;
  subcaption?: string;
}

export const REELS_PHOTOS: ReelPhoto[] = [
  {
    src: WEDDING_IMAGES.story_photo_one,
    caption: 'Where our story began',
    subcaption: 'Bangalore laughs & endless conversations'
  },
  {
    src: WEDDING_IMAGES.story_photo_two,
    caption: 'The Wayanad getaway',
    subcaption: 'Winding roads, off-key songs & happy moments'
  },
  {
    src: WEDDING_IMAGES.story_photo_three,
    caption: 'Finding home in each other',
    subcaption: 'Ukuleles, keyboards, and warmth'
  },
  {
    src: WEDDING_IMAGES.story_photo_four,
    caption: 'Choosing each other, always',
    subcaption: 'A lifetime of adventures together'
  }
];

/** "Our Story" swipeable moments (hook + cards). Lines are taken from WEDDING_CONTENT.story. */
export interface StoryMoment {
  title: string;
  text: string;
  image: WeddingImageKey;
  objectPosition?: string;
  /** extra zoom, e.g. to crop black bars baked into a photo */
  zoom?: number;
}

export const STORY_HOOK = 'After learning almost every South Indian language except Malayalam, he fell for a Malayali girl.';

export const STORY_MOMENTS: StoryMoment[] = [
  { title: 'Bangalore', text: 'Traffic moves slowly here, but somehow love found the express lane.', image: 'story_photo_one', objectPosition: '50% 20%' },
  { title: 'Two languages, one laugh', text: 'She’s from Keralam, he’s from Chennai. Different mother tongues, one shared language: laughter.', image: 'story_photo_four', objectPosition: '50% 30%' },
  { title: 'The Wayanad trip', text: 'Long drives, off-key singing and jokes only they understood.', image: 'story_photo_two', objectPosition: '50% 40%' },
  { title: 'The checklist', text: 'Hers: respect, reassurance, someone who makes life lighter. His: none. He just knew.', image: 'story_photo_three', objectPosition: '50% 25%', zoom: 1.3 },
  { title: 'Fate’s sense of humour', text: 'He learned almost every South Indian language except Malayalam… then fell for a Malayali girl.', image: 'p4', objectPosition: '50% 30%' },
  { title: 'Home', text: 'His keyboard, her ukulele, endless conversations. Now, with their families’ blessings, a lifetime of choosing each other.', image: 'p7', objectPosition: '50% 50%' }
];

export interface UnifiedMemoryPhoto {
  src: string;
  alt: string;
  caption?: string;
  subcaption?: string;
  ratio?: string;
}

export const UNIFIED_MEMORIES: UnifiedMemoryPhoto[] = [
  ...WEDDING_GALLERY.map(g => ({
    src: WEDDING_IMAGES[g.src],
    alt: g.alt,
    caption: g.alt,
    ratio: g.ratio || '3/2'
  })),
  ...REELS_PHOTOS.map(r => ({
    src: r.src,
    alt: r.caption,
    caption: r.caption,
    subcaption: r.subcaption,
    ratio: '4/5'
  }))
];

export const WEDDING_CONTENT = {
  groom: 'Lalith',
  bride: 'Anjana',
  inv1: 'We cordially invite you to celebrate our wedding and reception with the blessings of our families and elders.',
  inv3: 'Your presence would make our celebration truly special.',
  weddingVenue: 'Central Auditorium',
  weddingAddr: 'North Paravur, Kerala, India',
  weddingMap: 'https://maps.app.goo.gl/XAEM92g9pdnygrfF6',
  receptionVenue: 'Annalakshmi Restaurant',
  receptionAddr: '6 Mayor Ramanathan Salai, Chennai, India',
  receptionMap: 'https://maps.app.goo.gl/vN3tiGAB5BfHAyBB8',
  groomStory: 'A gentle soul with a laugh that fills every room. Always the first to say yes to an adventure.',
  brideStory: 'Graceful, warm and full of wonder. She turns every ordinary day into a celebration.',
  groomVow: '“In my every lifetime, I will find my way to you.”',
  brideVow: '“Until I am alive, your happiness and every little dream will be taken care of.”',
  story: `It all began in Bangalore, where traffic moves slowly, but somehow love found the express lane.

She is from Keralam, and he is from Chennai. They speak different mother tongues but share one language perfectly: laughter.

A trip to Wayanad with friends brought them closer through long drives, off-key singing, and jokes only they understood. She is quiet and observant, happiest in life’s little moments. He can turn any ordinary moment into fun, sometimes intentionally.

She has a checklist for love: respect, reassurance, and someone who makes life lighter. He has no checklist — he simply knows she is the one. After learning almost every South Indian language except Malayalam, he finds himself falling for a Malayali girl. Clearly, fate has a sense of humour and it has a particularly amusing plan for him.

Between his keyboard, her ukulele, countless conversations, and endless laughter, they find something that feels like home. He becomes her constant, always checking in, making time to talk, and reminding her that he is there.

Their journey brought challenges, but patience, understanding, and love gave them even more reasons to choose each other. No matter the disagreement, they always find their way back to peace, the one thing they both prefer over everything else. Along the way, they discovered that what they share is worth holding on to.

Now, with their families’ blessings, they are ready to begin a new chapter filled with songs, adventures, memories, and a lifetime of choosing each other.`
};

export interface LanguageContent {
  /** Cover greeting rendered as `{greetPrefix}<b>{name}</b>{greetSuffix}`. */
  greetPrefix: string;
  greetSuffix: string;
  open: string;
  inv1: string;
  inv3: string;
  shareMsg: (name: string, link: string) => string;
}

export const LANG_MAPPINGS: Record<Language, LanguageContent> = {
  en: {
    greetPrefix: 'Dear ',
    greetSuffix: ', with love we invite you',
    open: 'Open Invitation',
    inv1: 'We cordially invite you to celebrate our wedding and reception with the blessings of our families and elders.',
    inv3: 'Your presence would make our celebration truly special.',
    shareMsg: (name: string, link: string) => `Dear ${name},\n\nWith joy, Lalith & Anjana invite you to celebrate our wedding on November 29, 2026, and our reception on December 6, 2026. 🌺\n\nYour personal invitation: ${link}`
  },
  ta: {
    greetPrefix: 'அன்புள்ள ',
    greetSuffix: ', அன்புடன் உங்களை அழைக்கிறோம்',
    open: 'அழைப்பிதழைத் திறக்கவும்',
    inv1: 'எங்கள் குடும்பத்தினர் மற்றும் பெரியோர்களின் ஆசீர்வாதத்துடன், எங்கள் திருமணம் மற்றும் வரவேற்பு விழாவில் கலந்துகொண்டு சிறப்பிக்குமாறு உங்களை அன்புடன் அழைக்கிறோம்.',
    inv3: 'உங்கள் வருகை எங்கள் கொண்டாட்டத்தை மேலும் சிறப்பாக்கும்.',
    shareMsg: (name: string, link: string) => `அன்புள்ள ${name},\n\nலலித் & அஞ்சனா திருமணத்திற்கு (நவம்பர் 29, 2026) மற்றும் வரவேற்பு விழாவிற்கு (டிசம்பர் 6, 2026) உங்களை அன்புடன் அழைக்கிறோம். 🌺\n\nஉங்கள் அழைப்பிதழ்: ${link}`
  },
  ml: {
    greetPrefix: 'പ്രിയപ്പെട്ട ',
    greetSuffix: ', സ്നേഹത്തോടെ ഞങ്ങൾ നിങ്ങളെ ക്ഷണിക്കുന്നു',
    open: 'ക്ഷണക്കത്ത് തുറക്കുക',
    inv1: 'ഞങ്ങളുടെ കുടുംബാംഗങ്ങളുടെയും മുതിർന്നവരുടെയും അനുഗ്രഹത്തോടെ, ഞങ്ങളുടെ വിവാഹത്തിലും വിവാഹ സൽക്കാരത്തിലും പങ്കുചേരാൻ നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.',
    inv3: 'നിങ്ങളുടെ സാന്നിധ്യം ഞങ്ങളുടെ ആഘോഷത്തെ കൂടുതൽ സവിശേഷമാക്കും.',
    shareMsg: (name: string, link: string) => `പ്രിയപ്പെട്ട ${name},\n\nലളിത് & അഞ്ജന വിവാഹത്തിലേക്കും (നവംബർ 29, 2026) വിവാഹ സൽക്കാരത്തിലേക്കും (ഡിസംബർ 6, 2026) നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു. 🌺\n\nനിങ്ങളുടെ ക്ഷണക്കത്ത്: ${link}`
  }
};
