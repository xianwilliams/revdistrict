# RevDistrict integrations and launch handoff

The app is a working Next.js build. It is not yet connected to RevDistrict's production DMS or deployed to the dealership domain. No production messages were sent while building it.

## Inventory: keep dealr.cloud as the source of truth

The preview contains 262 vehicles captured from the public dealer site on September 23, 2026, including original photos, prices, mileage, specifications, descriptions and equipment. These are review data, not a live feed. Preview pages label this clearly and are noindex by default. All old vehicle paths resolve through the catch-all route, including slashes and punctuation in trim names.

The source dealer site's body-type filters were used to classify vehicles: 92 cars, 113 SUVs, 35 trucks, 10 vans, and 12 other vehicles. Do not infer classes from model-name substrings. A few source records advertise mileage as zero; these display as mileage on request instead of implying an unused vehicle.

Dealr.cloud documents inventory export feeds and receiving leads from third-party providers. The dealer authorizes feed setup in Manage → Settings → Feeds; custom destinations require coordination with their support team. This is an available integration route, not evidence that a RevDistrict feed is already approved or active.

Sources, checked September 23, 2026:
- [dealr.cloud inventory advertising and feed setup](https://help.dealr.cloud/docs/inventory/advertising/)
- [dealr.cloud inventory details and active/inactive status](https://help.dealr.cloud/docs/inventory/details/)
- [dealr.cloud product FAQ](https://dealr.cloud/product/faq)

### What is implemented

`src/lib/inventory.ts` loads a server-only HTTPS JSON endpoint from `INVENTORY_FEED_URL`, optionally using `INVENTORY_FEED_TOKEN` as a bearer credential. A Zod contract in `src/lib/vehicle.ts` validates it; only active records display. Responses are cached for five minutes. Missing configuration uses the clearly labeled preview. A configured but failed, invalid, or older-than-36-hours feed raises the page's designed error state instead of silently substituting the preview.

**The normalized JSON contract is ours. It is not a claimed dealr.cloud API schema.** After their actual export format is supplied, create one adapter that maps their feed into this contract. This may be a scheduled SFTP importer and HTTPS read endpoint, or a direct authenticated endpoint if offered. No undocumented private API or marketplace scraper is used. The existing website was only read to prepare this one-time preview.

The feed envelope is:

```json
{
  "capturedAt": "2026-09-23T20:00:00Z",
  "source": "RevDistrict authorized inventory feed",
  "vehicles": []
}
```

Use `vehicleSchema` for every record. Important fields: stable provider ID, legacy slug, VIN, stock, advertised price, mileage, make/model/trim, body type, drivetrain, transmission, engine, colors, ordered HTTPS image URLs, description paragraphs, equipment groups, CARFAX link, canonical source URL, and active/sold/inactive status. IDs and slugs must be mapped consistently from old listings. Do not index the preview as inventory for sale.

### Photo delivery contract

`src/lib/vehicle-images.ts` builds responsive photo widths only for the verified HTTPS `cdn.dealrimages.com` host, preserving all other URL parameters. Other provider image URLs remain unchanged, including signed URLs. The gallery preloads its first image, prepares only the next full photo after load (unless save-data is enabled), and loads small thumbnails lazily. These are presentation changes; the inventory schema, source of truth and feed adapter are unchanged.

Ask the production provider for stable, cacheable HTTPS image URLs and documented resizing behavior. If the final feed uses another CDN, add only its documented transform to the image helper after checking it against a real sample. Do not rewrite arbitrary hosts or signed query strings.

### Dealer/provider handoff, prepared for sending by the project owner

Ask Buddy to arrange the dealr.cloud introduction. The conversation screenshots establish that he offered to help; they are not permission to send messages or use the private phone numbers in those screenshots.

Request:
1. An authorized inventory export for a custom Next.js website, its format, authentication/delivery method and update frequency.
2. A sample with photos in display order, VIN/stock/provider ID, legacy website slug, price, mileage, features/equipment, disclosures, CARFAX links, and active/sold/inactive status.
3. Full-feed versus delta semantics, sold/deleted vehicle handling, image rights/URLs, expected inventory size and error monitoring.
4. An approved lead-delivery method, field mapping, test destination, CRM attribution, optional SMS-consent support, and confirmation semantics.
5. A stable hosted credit-application URL (or approved embed), independent of the domain that will redirect to the new site.

Validate a price change, one new listing, reordered images, and a sold vehicle in a provider test feed before launch. Agree the sold-vehicle policy: currently removed active records render 404 and offer inventory navigation. A sold archive/410 response can be added if the dealer wants it.

Scraping Facebook or KSL back into this site is not the recommended architecture. It would make downstream listings the source of truth and add duplication and stale-availability problems. Feed marketplaces outward from dealr.cloud as they do today.

## Leads and forms

Contact, trade valuation, vehicle inquiry, and test-drive forms post to `/api/leads`. Browser and server validation check required information, consent, phone and email; the server checks origin, request size and content type, applies a honeypot and a bounded in-process rate limit, and sends only to a configured HTTPS relay. No submissions are stored locally or logged. Tests use fictional data and isolated responses.

Configure `LEAD_WEBHOOK_URL` and optionally `LEAD_WEBHOOK_TOKEN` for the dealer-approved relay. The JSON body is a `Lead` from `src/lib/leads.ts`, plus an ID, source and timestamp. The request includes the same ID as `Idempotency-Key`. The relay must accept durably before returning 2xx and deduplicate that key. Map it to dealr.cloud's confirmed API/ADF/email method only after their specifications are known. A timed-out relay is reported as unconfirmed delivery, not success; do not automatically retry.

Without a relay, the endpoint returns 503 and the form offers the dealer's existing phone and email. There is no fake success state. Test-drive submission requests a time; it never promises a confirmed appointment.

Before production, use the host's trusted reverse proxy configuration and shared edge/WAF rate limiting. The in-process limiter is appropriate for the local preview and a single process; it does not coordinate multiple replicas, and forwarded IPs must be sanitized by the host. Confirm relay data retention, access controls and encryption. No credit-application data, SSNs, bank details, or driver's licenses are collected in these forms.

The current public business email is retained until the owners supply a rebrand address. Do not substitute personal contacts from the supplied conversation.

## Financing

The new financing page includes a working payment estimator. It does not perform a credit check or send calculator values. It links to the current DMS-hosted application using `FINANCE_APPLICATION_URL`.

**Before redirecting the old domain**, replace that fallback URL with the stable provider-hosted application URL; otherwise a blanket redirect can lead back into this page. The full sensitive application stays with the established provider. The existing application fields were audited: applicant/co-applicant identity, residence and employment history, income, trade details and authorizations. These were deliberately not duplicated into a new unconnected form.

## Video replacement

Two independent slots live in `src/lib/media.ts`. Change `src`, `poster`, title and caption there. The home and story pages share the welcome slot; the story page adds the second slot. Supplied media is hosted locally, opt-in, and has native playback controls. No third-party social embeds, autoplay audio, or social feeds are needed.

- Welcome slot: the supplied Instagram showroom tour, compressed for web, with its original burned-in speech captions retained.
- Story slot: a short silent behind-the-scenes excerpt from the supplied YouTube video.

For future spoken replacements, provide accurate captions (WebVTT via `<track>` or burned captions) and a transcript. Do not use the old clip's captions for new footage.

## Contact and privacy

Address, phone, email and opening hours were verified against the current dealership contact page. The privacy page covers the implemented data paths rather than copying assertions about systems that are not connected. The dealer should review its policy and actual providers before launch.

## Decorative background films

The header/background films are separate from listing photos and the two opt-in owner slots. `AmbientFilm` supplies local posters, muted loops and explicit pause controls for Sell / Trade, Financing, Inventory, Contact and The District. They have no dependency on the DMS. Their sources and rebuild script are recorded in `CONTENT-AND-SOURCES.md` and `VISUAL-REFINEMENT.md`.
