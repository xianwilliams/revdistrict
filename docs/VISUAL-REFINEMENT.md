# Visual refinement, September 23, 2026

The user requested a substantially more expressive second pass: darker neutral black, less green, serif headline styling closer to their Ultraviolet screenshot, a larger angled “Find your frequency” instrument, gold type that catches light on scroll, and clean footage of the dealership’s own cars and people. Existing inventory and contact journeys stay functional.

## Second-pass direction (display font superseded below)

- Bodoni Moda normal/italic display typography, Manrope body text and the existing IBM Plex Mono labels. Shared headings across the catalog, car pages, financing, story and contact inherit the new type system.
- A full-screen, chapter-selectable silent film beneath a left-anchored headline and the existing Explore inventory button. Media, typography and vertical framing move independently on scroll. Playback pauses offscreen and when the tab is hidden; reduced-motion and data-saving preferences default to a static poster. Visitors can explicitly start or pause it.
- A much larger perspective-tilted tachometer connected to actual drive-style filtering, staggered featured cars, and native horizontal card scrolling on phones.
- Scroll-driven gold sheen, image reveals, a framed owner-film composition with an inset still, three photographic buying paths, and a road-photo closing invitation.
- Neutral black surfaces replace the previous green cast. Gold remains an accent. The user expressly requested the text sheen; that takes precedence over the scroll-craft skill’s default ban on gradient text.

## Film edit

All seven cuts use original files supplied by the user. No stock, generated footage or reference-site assets were added. The native Higgsedit editor was unavailable locally; the edit was rendered with FFmpeg, without uploading the source files to a third party. No audio stream is shipped in either background reel.

| Source | In point (seconds) | Length | Shot |
|---|---:|---:|---|
| He bought his dream car at 19 | 658.3 | 3.7 | BMW details and parked cars |
| Surprising my brother with his dream Toyota | 10.3 | 3.3 | 4Runner exterior details |
| He bought his dream car at 19 | 298.5 | 3.0 | Porsche cabin |
| Taking delivery of my new Durango Hellcat | 48.8 | 3.0 | Showroom and people |
| Taking delivery of my new Durango Hellcat | 175.0 | 3.0 | Team member in the garage |
| Taking delivery of my new Durango Hellcat | 116.0 | 3.0 | Detailing |
| He bought his dream car at 19 | 781.7 | 3.0 | Mustang driving |

Rebuild with `.venv/bin/python scripts/build-hero-montage.py` from the project root. This requires FFmpeg, Pillow and the supplied originals under the ignored `research/source-media/YOUTUBE CONTENT/` folder. The script writes a 1600×800 desktop MP4, a 540×720 phone MP4, six WebP stills, and the exact edit list under ignored research. Both reels use H.264, 24 fps, `yuv420p` and fast-start metadata.

The montage was checked through contact sheets and live webpage frames. It contains no burned subtitles or graphic titles. The original opt-in Instagram welcome film is separate and retains its existing speech captions. Car film imagery establishes brand atmosphere; each inventory listing continues to use only its own factual photographs.

## Review path

Open http://localhost:3001. Watch or select each hero chapter, pause the film, scroll through the gold headlines, change the drive style and open its collection. Continue through the people, buying paths and visit scene. Repeat at phone width and with reduced motion. All review commands and remaining production integration requirements are recorded in [VERIFICATION.md](VERIFICATION.md).

## Third pass: interior depth, loading, and client-approved type direction

The latest user direction supersedes the serif display face: the client wants clean, technical, car-culture typography, with Nexola as the new type reference. All display roles now use upright Inter with uppercase headings, a heavier weight and tight spacing. Body copy remains sentence case; technical labels retain IBM Plex Mono. Headline sizes were recomposed for desktop and phone rather than carrying over the serif metrics. The gold scroll sheen remains.

All requested interior additions are implemented:

- Sell / Trade: full-width driving-film hero and a manually controlled dealership-photo carousel beside the valuation process.
- Financing: slow cabin footage behind the left-hand introduction, dark local overlay and edge fade into the calculator; three drawn process icons; a real team photo beside the FAQs.
- Inventory: a cinematic cabin backdrop in the heading only. Catalog filtering, photo cards and DMS data are outside the new motion choreography.
- Contact and The District: showroom footage behind their opening headings. The District also has a one-time, scroll-triggered transparent logo reveal, which settles into a static mark.
- Every content route: subtle heading/copy entrances, image reveals and restrained parallax where suitable. Data tables, forms, calculators and catalog results stay immediately usable.
- Shared navigation: corrected title capitalization, a clearly filled gold Let’s Talk button on desktop and phone, and a clean transparent white logo treatment.

Background videos use `preload="none"`; autoplay starts only after page load and when visible. They pause offscreen and in background tabs. Reduced-motion and save-data preferences use the poster by default, with an explicit play control. Text is kept on a dark local scrim. Main hero headings are never faded out while waiting for animation.

### Photo loading

Listing and gallery photos now receive responsive source sets, including smaller thumbnails. The first vehicle photo is preloaded; after it loads, only the next full photo is prepared in a mounted image, so a click can reuse its decoded pixels. Save-data skips that prefetch. Only the known `cdn.dealrimages.com` width parameter is transformed; another future DMS image host retains its original URL. No inventory schema or lead-delivery change is required.

The local cold-cache, 1.6 Mbps/150 ms/4× CPU comparison on the Acura page measured phone LCP at 2.44 s, down from 3.29 s, and next-photo click-to-decoded-image at 113 ms, down from 433 ms. Desktop LCP was 3.64 s versus 3.50 s; desktop next-photo was 113 ms versus 452 ms. These are individual local lab runs, not field Core Web Vitals certification. The production host, CDN and physical devices still need launch measurements.

The updated checks and exact evidence paths are in [VERIFICATION.md](VERIFICATION.md).

## September 24: client priorities and desktop scale

The client retained the direction and requested a closer match to the original logo's gold. The shared accent now uses `#e5aa3d`; sheen stops use deeper amber shadows and brighter warm highlights. Existing white transparent marks, technical uppercase type and black/charcoal surfaces remain.

Inventory, financing and consignment now form the first content section after the hero. They use compact, consistently sized photographic links; financing explicitly spans great credit through buy here, pay here. The Sell / Trade route remains available beneath them and in navigation. The new consignment page reuses the established cinematic hero, drawn process icons, photo carousel and lead form.

Desktop home hero height changed from 100svh with a 790–1100px range to 90svh with a 670–880px range. Shared section spacing now tops out at 96px rather than 128px; the drive stage/dial, people scene, visit scene and interior heroes are tighter. Service images use landscape proportions instead of oversized near-square blocks. Phone layouts retain touch-friendly controls; new service headings stack above descriptions rather than competing for two narrow columns.

The native application uses the same type, dark inputs and gold actions, with a quiet step sidebar on desktop and horizontally scrollable progress on phones. Forms themselves are excluded from decorative movement. No new film files or dependencies were required for this pass. Fresh evidence is recorded in `research/client-feedback/` and the verification handoff.
