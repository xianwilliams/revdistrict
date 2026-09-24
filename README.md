# RevDistrict

Next.js dealership website for the rebrand of The Used Car Factory in Midvale, Utah. Neutral black/charcoal, warm gold, bold uppercase Inter display type and IBM Plex Mono. A custom reel of the dealership’s cars and people, lightweight interior background films, GSAP scene depth, drawn icons, an oversized interactive instrument, responsive listing photography and replaceable owner-video slots.

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. Start with home → inventory → Acura Integra → gallery → request a test drive. Also review financing, sell/trade, contact, and the story page at phone width.

The build contains a clearly labeled 262-vehicle preview captured September 23, 2026. Live dealr.cloud inventory and CRM delivery need dealer-authorized configuration. Unconfigured forms fail honestly and offer the existing phone/email; no lead is silently stored or falsely acknowledged. The existing secure financing application remains with the provider.

- [Integration contract and provider handoff](docs/INTEGRATIONS.md)
- [Namecheap deployment](docs/DEPLOYMENT.md)
- [Content, page parity and asset provenance](docs/CONTENT-AND-SOURCES.md)
- [Validation evidence and review notes](docs/VERIFICATION.md)
- [September visual refinement and film edit](docs/VISUAL-REFINEMENT.md)

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:integrations
npm audit --audit-level=high
npm run test:e2e
```

Browser tests expect the app on localhost:3000. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for a different installed Chromium path; on other systems use a Playwright-installed browser and adjust the launch setting. `TEST_BASE_URL` selects an alternate running environment. No tests send production leads.

Integration tests require OpenSSL and the compiled build. They start isolated local HTTPS inventory/lead fixtures and a temporary app process, then clean up. Screenshot reviews are reproducible with `scripts/visual-review.mjs`, `scripts/motion-review.mjs`, `scripts/interior-motion-review.mjs` and `scripts/performance-review.mjs` against the running site.

Key edits: `src/lib/site.ts` for public contacts; `src/lib/media.ts` for video swaps; `src/app/globals.css` for shared design tokens; `src/app/editorial.css` for the film, instrument and editorial layouts; `src/app/atmosphere.css` for interior films, the transparent mark and section details. Font loading is in `src/app/layout.tsx`; provider photo sizing is in `src/lib/vehicle-images.ts`. `.env.example` lists production settings. Never expose feed or lead-relay tokens through `NEXT_PUBLIC_` variables.
