from pathlib import Path

folder = Path('assets/images')
mapping = {
    'photo-p1.jpg': 'gallery-couple-doorway-portrait.jpg',
    'photo-p2.jpg': 'wedding-hero-couple-trees.jpg',
    'photo-p3.jpg': 'gallery-couple-white-wall-portrait.jpg',
    'photo-p4.jpg': 'gallery-couple-lotus-closeup-portrait.jpg',
    'photo-p5.jpg': 'gallery-couple-lotus-boat-landscape.jpg',
    'photo-p6.jpg': 'hero-couple-lotus-field.jpg',
    'photo-p7.jpg': 'gallery-couple-water-lotus-landscape.jpg',
    'photo-p8.jpg': 'gallery-couple-lotus-wide-landscape.jpg',
    'photo-p9.jpg': 'gallery-bride-lotus-landscape.jpg',
    'photo-p10.jpg': 'bride-office-portrait.jpg',
    'photo-p11.jpg': 'groom-studio-portrait.jpg',
    'photo-p12.jpg': 'groom-park-portrait.jpg',
    'photo-p13.jpg': 'story-photo-01.jpg',
    'photo-p14.jpg': 'story-photo-02.jpg',
    'photo-p15.jpg': 'invitation-floral-background.jpg',
    'photo-p16.jpg': 'couple-floral-background.jpg',
    'photo-p17.jpg': 'events-elephant-floral-background.jpg',
    'photo-p18.jpg': 'hero-decoration-mobile.jpg',
    'photo-p18w.jpg': 'hero-decoration-desktop-wide.jpg',
    'photo-p19.jpg': 'hero-decoration-bottom-right.jpg',
    'photo-w1.jpg': 'wedding-venue-central-auditorium.jpg',
    'photo-r1.jpg': 'reception-venue-annalakshmi.jpg',
}

for old, new in mapping.items():
    source = folder / old
    target = folder / new
    if not source.exists():
        raise SystemExit(f'Missing source: {source}')
    if target.exists():
        raise SystemExit(f'Target already exists: {target}')
    source.rename(target)

print(f'Renamed {len(mapping)} images')
