# Lalith & Anjana · Wedding Invitation

A modern React + TypeScript + Vite wedding invitation application for Lalith and Anjana, featuring authentic South Indian wedding aesthetics, interactive animations, background music with procedural drone fallback, dynamic multilingual personalized greetings, and an upgraded, intuitive RSVP experience.

## Key Features

1. **Cover Experience**:
   - Traditional layered artwork: Kerala/Tamil Nadu landscape, warm glow, swaying floral garland with flickering brass lamps, golden altar pillars, rising sparkles, and SVG thali necklace ornament.
   - Refined couple centerpiece with rotating mandala halo.
   - Personalized guest greeting (`?to=GuestName` or `?i=<token>` with English, Tamil, and Malayalam support).
   - Real-time India Standard Time (IST) countdown to wedding muhurtham.
   - Animated lotus-petal curtain transition with synthesized temple bell chime on opening.
   - Falling flower petals with customizable densities and reduced-motion support.

2. **Invitation & Story**:
   - Sacred shloka and personalized blessings in English, Tamil, or Malayalam.
   - Groom & Bride portraits with arch frames, bios, and personal vows.
   - Narrative story of their journey from Bangalore to Wayanad with expandable read-more toggle.
   - 3D interactive Memory Reel featuring 9 gallery photographs, auto-progression, touch swiping, and full-screen accessible Lightbox modal.

3. **Event Celebrations**:
   - Wedding (Muhurtham) & Reception cards with venue photos, times, addresses, Google Maps directions, and 1-click Google Calendar integration.
   - Live event countdown timer.
   - Day-of event status banner on IST celebration dates.

4. **Redesigned RSVP Experience**:
   - **Clean & Minimal**: Direct, welcoming heading "Will you be celebrating with us?" without lengthy explanatory paragraphs.
   - **Dedicated Event Cards**: Compact cards for "OUR WEDDING" (29 Nov 2026) and "OUR RECEPTION" (6 Dec 2026).
   - **Independent Attendance**: Single selectable option "❤️ Yes, will be there" with unmistakable active state. Selecting an event reveals an independent guest count stepper (default 1, visible `−` and `+` controls). Deselecting clears the guest count.
   - **Independent Guest Count**: Guest count applies strictly per celebration without forcing shared numbers.
   - **Dedicated Wishes Section**: Compact textarea with heading "A little wish for us ❤️" and placeholder "Leave us a little message or your blessings...". Optional and preserved during edits.
   - **Single Unified Submission**: One prominent button "Send with Love ❤️" with instruction "Your responses for both celebrations will be submitted together."
   - **Friendly Feedback**: Validates that at least one celebration is selected, handles loading state, provides graceful error recovery, and displays a confirmation card with attendance breakdown and "Change my response" option.

5. **Wishes Wall & Host Guest Tracker**:
   - Continuous marquee track of blessings from loved ones with guest initials/photos.
   - Host Guest Tracker modal (`?tracker=1` or footer toggle) with separate attendance counters for Wedding and Reception, search & status filters, WhatsApp invite buttons, and Quick Link generator.

## Development

- Start local dev server on port 3000:
  ```bash
  npm run dev
  ```
- Build for production:
  ```bash
  npm run build
  ```
- Typecheck & Lint:
  ```bash
  npm run lint
  ```
