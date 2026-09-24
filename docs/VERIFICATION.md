# Verification and review handoff

Checked September 23, 2026 against the compiled Next.js application, served through the included `server.cjs`. The review preview is running at **http://localhost:3001**. To restart it: `npm run build`, then `PORT=3001 node server.cjs`. Normal development uses `npm run dev` at http://localhost:3000.

## Completed checks

| Check | Result |
|---|---|
| TypeScript, ESLint, Prettier | Passed |
| Production build and custom-server startup | Passed |
| Dependency audit | 0 reported vulnerabilities |
| Domain tests | 7 passed: source facts/body types, legacy paths, payment calculations, drive styles, lead validation, rate limiting and provider photo URL sizing/fallback |
| Browser tests | 14 passed: search/filter/pagination, saves, drive selector, gallery/keyboard, repeated test-drive intent, calculator, failed lead delivery, endpoint guards, mobile navigation, opt-in film, hero chapters/pause, offscreen pause, scroll sheen, responsive gallery sources/next-photo prefetch, interior films/carousel and accessibility |
| Accessibility scan | Zero Axe WCAG 2 A/AA and 2.1 AA violations on home, inventory, Acura detail, financing, trade and contact |
| HTTPS integration fixtures | Passed: authenticated feed, sold filtering, missing facts/photos, lead acceptance and rejection, idempotency reference, invalid/honeypot leads not forwarded |
| Responsive route captures | 19 page/viewport combinations returned 200 with no horizontal overflow, page JavaScript errors or broken loaded images |
| Motion captures | Original 51 home states plus 30 final interior states across desktop, touch-emulated phone and reduced motion; all final states have no overflow or page errors |

Commands and fixtures live in `tests/` and `scripts/`. The local integration fixtures use temporary certificates and synthetic data; they send nothing to the dealership or provider.

## Visual evidence

Ignored `research/technical-type/` contains the final uppercase Inter complete-page and opening captures at 1440×1000 and 390×844 for all content pages, plus home/inventory/vehicle at 360×640. Images were allowed to decode before captures. `results.json` records response status, overflow, page errors and broken images.

Ignored `research/editorial-motion/` contains six hero scroll positions, four home scenes and seven representative film frames for each of three modes: 1440×1000 standard motion, 390×844 touch emulation and 1440×1000 reduced motion. `results.json` records media, headline, vertical rail and dial transforms, sheen position, and each selected video source and dimensions. Reduced motion leaves the film paused by default and disables the scroll transforms. The static tilted instrument and all controls remain usable.

Final uppercase Inter pixels were inspected for home, inventory, vehicle detail, story, finance, trade and contact, including intermediate hero states and the brightest film cuts. The revision corrected a streamed-layout measurement race affecting gold sheen, unstable SVG rounding during hydration, phone chapter sizing, a team-film caption overlap and a distracting road cut. The text scrim was strengthened behind the desktop headline. Original inventory photography remains factual and varies by listing.

Source cut review and the final replacement road sequence are retained in ignored `research/montage-proof/` and `research/montage-final-proof/`. Both final MP4s are 22 seconds at 24 fps with no audio stream: desktop 1600×800, 5.55 MB; phone 540×720, 1.91 MB. No burned subtitles or graphic titles appear in the hero reel.

## Latest interior and typography evidence

`research/interior-motion/` contains 30 final captures of the new interior sections at 1440×1000 standard motion, 390×844 touch emulation and 390×844 reduced motion. The recorded states cover Financing intro/process/FAQ, Sell / Trade intro/carousel, The District intro/settled logo, Contact intro/details and Inventory intro. All states have no horizontal overflow or JavaScript errors. Drawn icons finish at zero stroke offset; the logo finishes at opacity 1; background films pause when offscreen and default to paused under reduced motion.

The client rejected the previous serif direction. All main headings, film chapters, display captions and vehicle titles now use upright Inter, with uppercase display roles. Bodoni and Manrope are removed from dependencies. The font is self-hosted and preloaded through `next/font/local`; body text stays sentence case and labels retain IBM Plex Mono. The final 19-route capture pass confirmed no broken loaded images, page errors or overflow at desktop, 390px and selected 360px layouts.

## Local loading comparison

The repeatable script is `scripts/performance-review.mjs`. It uses a fresh Chromium context, disabled HTTP cache, 1.6 Mbps download/150 ms latency/4× CPU throttling, a 1440px desktop or 390px DPR2 phone viewport, and reduced motion. It waits for the first photo to decode, then 1.2 seconds, and measures the next-photo click through decode. Both comparison runs use the Acura listing.

| Measurement | Before | Final |
|---|---:|---:|
| Phone LCP | 3,288 ms | 2,440 ms |
| Phone next-photo click to decoded image | 433 ms | 113 ms |
| Desktop LCP | 3,504 ms | 3,644 ms |
| Desktop next-photo click to decoded image | 452 ms | 113 ms |
| Phone primary image width | 1,600px | 1,080px |
| Desktop primary image width | 1,600px | 1,440px |

Raw evidence is in ignored `research/performance/before.json` and `research/performance/technical-type.json`. These are individual local lab runs, not a production Core Web Vitals pass. Phone LCP and photo changes improved; desktop LCP did not improve in this run. Confirm deployed caching, host response time and real-device performance before launch. Background videos defer until the page has loaded, and only play while visible.

## Design and feel check

The brief was self-authored under the user's explicit creative delegation. A multi-entry showroom was chosen because many visitors land directly on a car. An uninterrupted film, locked narrative, or pinned scroll sequence would obstruct that route; a plain document or utility-only dashboard would underserve the requested brand experience. The implementation uses native Next.js markup and custom GSAP choreography rather than shipping the unused standalone Scrollcraft engine.

The signature is the driving-style selector: a rev-counter needle changes with the selected collection, the real cars change, and the choice continues into inventory search. The revised hero has independently moving film, typography and fine framing planes. Its three chapter controls expose the cars, people and driving scenes. Two separate supplied-video slots provide the personal introduction. The current type system, film edit and user-directed refinement are documented in `VISUAL-REFINEMENT.md`.

The inspected sequence reads as arrival → choice → confidence → people → practical next steps → invitation. This matches the intended curiosity → agency → confidence → warmth → clarity → readiness curve. The car-selection section is the largest interactive stage; no empty pinned scrolling was added. The ending resolves with a visit invitation, hours and phone. Phone composition uses a separately framed portrait reel, large headline and clear primary action. The fingerprint registry was empty before this build; its first row now records the result.

## Independent review

The engineering-standard simplicity review found the component structure appropriately small. Its concrete findings were addressed: source mileage/body parsing, phone validation, test-drive intent including repeated clicks, unknown facts in metadata, and generated imagery as a missing-photo fallback. Missing listing images now receive neutral text. The supplied welcome clip already has burned speech captions; the second excerpt is silent. The independent second-pass editorial review found the component structure appropriately simple and identified a remounted live region; its changing key was removed so selection announcements use a stable region. The third-pass review caught a duplicated Story hero tween and insufficient FAQ-photo overscan for parallax; both were fixed. A final read-only review of local Inter loading and the mounted next-photo prefetch found no new actionable issues. No unresolved review finding is being hidden behind the passing tests.

## What remains unverified

- Real dealr.cloud export/API authorization, mapping, update cadence and CRM lead receipt. The app's normalized JSON contract is not a claim that dealr.cloud already exposes that shape. The provider handoff is in `INTEGRATIONS.md`.
- Namecheap hosting-plan capability, server limits, DNS, TLS and deployed performance. A registrar account alone does not establish Node hosting. No public deployment or DNS changes were made.
- A stable provider-hosted credit application URL for the rebrand. The existing financing page is linked for now; replace it before redirecting the old domain.
- Real iPhone/Android hardware, Safari, low-power video behavior and manual screen-reader evaluation. Phone checks here are Chromium emulation, not physical-device testing.
- Dealer approval of rebrand copy, retained business contact details, video choices, privacy notice and final live inventory/lead flow.

For the human review, start at home, change the drive style, open inventory, search “Acura Integra,” open the vehicle, use the gallery, and request a test drive. Check financing, sell/trade, contact and the story page at phone width. The unconfigured preview deliberately does not claim that a form message was sent.
