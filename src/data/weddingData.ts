export interface EventItem {
  id: 'wedding' | 'reception';
  title: string;
  sub: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  mapUrl: string;
  photoKey: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
  ratio: string;
  position?: string;
  caption?: string;
}

export const WEDDING_IMAGES: Record<string, string> = {
  p1: "/assets/images/gallery-couple-doorway-portrait.jpg",
  p2: "/assets/images/wedding-hero-couple-trees.jpg",
  p3: "/assets/images/gallery-couple-white-wall-portrait.jpg",
  p4: "/assets/images/gallery-couple-lotus-closeup-portrait.jpg",
  p5: "/assets/images/gallery-couple-lotus-boat-landscape.jpg",
  p6: "/assets/images/hero-couple-lotus-field.jpg",
  p7: "/assets/images/gallery-couple-water-lotus-landscape.jpg",
  p8: "/assets/images/gallery-couple-lotus-wide-landscape.jpg",
  p9: "/assets/images/gallery-bride-lotus-landscape.jpg",
  p10: "/assets/images/bride-office-portrait.jpg",
  p11: "/assets/images/groom-studio-portrait.jpg",
  p12: "/assets/images/groom-park-portrait.jpg",
  p13: "/assets/images/story-photo-01.jpg",
  p14: "/assets/images/story-photo-02.jpg",
  p15: "/assets/images/invitation-floral-background.jpg",
  p16: "/assets/images/couple-floral-background.jpg",
  p17: "/assets/images/events-elephant-floral-background.jpg",
  p18: "/assets/images/hero-decoration-mobile.jpg",
  p18w: "/assets/images/hero-decoration-desktop-wide.jpg",
  p19: "/assets/images/hero-decoration-bottom-right.jpg",
  w1: "/assets/images/wedding-venue-central-auditorium.jpg",
  r1: "/assets/images/reception-venue-annalakshmi.jpg",
  hero_cover: "/assets/images/wedding-couple-cutout-refined.webp",
  hero_scene_desktop: "/assets/images/hero-scene-desktop.webp",
  hero_scene_mobile: "/assets/images/hero-scene-mobile.webp",
  story_photo_one: "/resized_couple_photos/couple_photo_1.jpg",
  story_photo_two: "/resized_couple_photos/couple_photo_2.jpg",
  story_photo_three: "/resized_couple_photos/couple_photo_3.jpg",
  story_photo_four: "/resized_couple_photos/couple_photo_4.png",
};

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

export const GALLERY_DIMENSIONS: Record<string, [number, number]> = {
  p1: [1125, 1500],
  p2: [1125, 1500],
  p3: [960, 1280],
  p4: [1163, 1500],
  p5: [1500, 1000],
  p6: [1500, 1000],
  p7: [1500, 1000],
  p8: [1500, 1000],
  p9: [1500, 1000]
};

export const WEDDING_CONTENT = {
  groom: 'Lalith',
  bride: 'Anjana',
  bless: 'With the blessings of our families, friends and elders',
  inv1: 'We cordially invite you to celebrate our wedding and reception with the blessings of our families and elders.',
  inv2: '',
  inv3: 'Your presence would make our celebration truly special.',
  shloka: '॥ श्री गणेशाय नमः ॥',
  weddingDate: '2026-11-29T08:00',
  weddingEnd: '09:20',
  weddingVenue: 'Central Auditorium',
  weddingAddr: 'North Paravur, Kerala, India',
  weddingMap: 'https://maps.app.goo.gl/XAEM92g9pdnygrfF6',
  receptionDate: '2026-12-06T18:00',
  receptionEnd: '22:30',
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

export const LANG_MAPPINGS = {
  en: {
    greet: (name: string) => `Dear <b>${name}</b>, with love we invite you`,
    open: 'Open Invitation',
    inv1: 'We cordially invite you to celebrate our wedding and reception with the blessings of our families and elders.',
    inv3: 'Your presence would make our celebration truly special.',
    shareMsg: (name: string, link: string) => `Dear ${name},\n\nWith joy, Lalith & Anjana invite you to celebrate our wedding on November 29, 2026, and our reception on December 6, 2026. 🌺\n\nYour personal invitation: ${link}`
  },
  ta: {
    greet: (name: string) => `அன்புள்ள <b>${name}</b>, அன்புடன் உங்களை அழைக்கிறோம்`,
    open: 'அழைப்பிதழைத் திறக்கவும்',
    inv1: 'எங்கள் குடும்பத்தினர் மற்றும் பெரியோர்களின் ஆசீர்வாதத்துடன், எங்கள் திருமணம் மற்றும் வரவேற்பு விழாவில் கலந்துகொண்டு சிறப்பிக்குமாறு உங்களை அன்புடன் அழைக்கிறோம்.',
    inv3: 'உங்கள் வருகை எங்கள் கொண்டாட்டத்தை மேலும் சிறப்பாக்கும்.',
    shareMsg: (name: string, link: string) => `அன்புள்ள ${name},\n\nலலித் & அஞ்சனா திருமணத்திற்கு (நவம்பர் 29, 2026) மற்றும் வரவேற்பு விழாவிற்கு (டிசம்பர் 6, 2026) உங்களை அன்புடன் அழைக்கிறோம். 🌺\n\nஉங்கள் அழைப்பிதழ்: ${link}`
  },
  ml: {
    greet: (name: string) => `പ്രിയപ്പെട്ട <b>${name}</b>, സ്നേഹത്തോടെ ഞങ്ങൾ നിങ്ങളെ ക്ഷണിക്കുന്നു`,
    open: 'ക്ഷണക്കത്ത് തുറക്കുക',
    inv1: 'ഞങ്ങളുടെ കുടുംബാംഗങ്ങളുടെയും മുതിർന്നവരുടെയും അനുഗ്രഹത്തോടെ, ഞങ്ങളുടെ വിവാഹത്തിലും വിവാഹ സൽക്കാരത്തിലും പങ്കുചേരാൻ നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.',
    inv3: 'നിങ്ങളുടെ സാന്നിധ്യം ഞങ്ങളുടെ ആഘോഷത്തെ കൂടുതൽ സവിശേഷമാക്കും.',
    shareMsg: (name: string, link: string) => `പ്രിയപ്പെട്ട ${name},\n\nലളിത് & അഞ്ജന വിവാഹത്തിലേക്കും (നവംബർ 29, 2026) വിവാഹ സൽക്കാരത്തിലേക്കും (ഡിസംബർ 6, 2026) നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു. 🌺\n\nനിങ്ങളുടെ ക്ഷണക്കത്ത്: ${link}`
  }
};
