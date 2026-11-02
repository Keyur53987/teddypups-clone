# Validation record

Checked on 2 November 2026.

## Automated checks

`npm test`: 5 tests passed, 0 failed.

- Every one of the 49 page templates contains content and a main heading.
- Local page links resolve to known routes; referenced local page assets exist.
- No copied reference runtime scripts remain in page templates.
- All normalized puppy gallery media/poster files exist.
- Catalog filtering combines search, breed and origin correctly, including hyphenated breed names.
- Gallery index navigation wraps in both directions.
- Enquiry text uses only supplied fields.

`npm run build`: 49 pages generated successfully. Both the root-hosted local configuration and the `/teddypups-clone` project-hosted configuration built successfully.

## Browser checks performed

- Desktop homepage rendered with local branding, fonts, imagery, layout and navigation.
- Catalog search for `Max` produced `1 puppy` and the matching available listing.
- FAQ expansion changed `aria-expanded` to `true`.
- FAQ search for `vaccinated` left one matching card visible.
- Imported journey tab became selected; the local panel was hidden and the imported panel visible.
- Max's gallery advanced to item `2 / 2`, displayed the explicit unavailable-video poster message, and opened the full-screen viewer.
- Contact form with dummy name and phone produced the explicit unsent enquiry handoff and WhatsApp/email links. No enquiry was sent to the business.
- At a 390 × 844 viewport, the homepage had no horizontal overflow and the mobile navigation dialog opened.
- The family gallery contains 64 photo buttons. A later family-lightbox check hit a browser-control timeout; that specific check was not counted as passed.

## Review limits

The reference's private backend is unavailable; form server delivery is not claimed. Some profile videos returned HTTP 403 and remain explicit poster fallbacks. Pixel-by-pixel parity and the original proprietary animation behavior are not claimed. A Loom recording must be made by the applicant and added to the submission.

Deployment status and live URL should be verified separately at handoff; a successful local build alone is not proof of publication.
