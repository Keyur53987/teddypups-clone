# TeddyPups website clone

Technical assignment for Insta Biz Web. A responsive, self-contained static reconstruction of [the supplied reference](https://puppy.instabizweb.com/), covering 49 routes.

[Live website](https://keyur53987.github.io/teddypups-clone/) · [Validation record](docs/VALIDATION.md) · [Loom guide](docs/LOOM-WALKTHROUGH.md) · [AI disclosure](docs/AI-PROMPTS.md)

## Run locally

Requires Node.js 20 or newer. There are no npm dependencies to install.

```sh
npm run build
npm run dev
```

Open http://localhost:4173. Run `npm test` for the filtering, gallery-index, and enquiry-message tests.

## Implementation and attribution

This is an **adaptation of the reference's public rendered HTML, CSS, illustrations, fonts, photos and copy**, not a claim that its visual design or markup was independently authored. The public Next.js-rendered pages were normalized into local HTML templates. Original Next.js runtime scripts, tracking and server-action dependencies were removed. The build, standalone interaction code, data normalization, tests, portable routing and deployment workflow were written for this assignment with Codex assistance.

The original look is preserved through the reference's visual styles and assets; browser behavior is rebuilt in `src/client/app.js`. This choice prioritizes visual fidelity and an inspectable, dependency-free static deployment. Be explicit about this approach in the walkthrough; do not describe it as an independently designed React application.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/pages/` | Editable page content for all 49 routes |
| `src/partials/` | Shared header and footer |
| `src/client/app.js` | Menu, FAQ, journey tabs, galleries, filters and form handoff |
| `src/client/logic.js` | Pure, tested interaction helpers |
| `src/client/app.css` | Accessibility, modal and behavior styling |
| `src/site.json` | Route and reference-style configuration |
| `public/assets/` | Local images, fonts and visual styles |
| `public/data/` | Normalized catalog and gallery metadata |
| `scripts/build.mjs` | Static page generation, asset copying and hosting path support |
| `scripts/serve.mjs` | Local static preview server |
| `scripts/capture-reference.py` | One-time reference normalization tool; requires Beautiful Soup |
| `scripts/extract-data.py` | One-time catalog/gallery extraction tool |
| `tests/` | Node built-in test runner tests |
| `scripts/deploy.mjs` | Test, build, and push the static Pages branch |
| `docs/` | AI log, walkthrough guide, validation record and email templates |

## Functionality

- Home, catalog, 42 puppy profiles, gone-home archive, family gallery, FAQ, process and contact pages.
- Shared responsive navigation and native mobile menu dialog.
- Catalog search plus breed/origin filtering; filters initialize from and update query parameters.
- FAQ search and accessible expanding answers.
- Journey tabs with keyboard navigation.
- Family photo viewer and puppy gallery navigation, thumbnails and keyboard controls.
- Native required-field/email validation, honeypot field, and explicit enquiry handoff to WhatsApp/email.
- Local photos and fonts, no reference-site runtime requests, reduced-motion support, skip navigation, focus styles and a custom 404.

## Known limits

- **Enquiries:** no original backend credentials or API are available. The form prepares a message for the visitor to send using WhatsApp/email and never claims a server submission succeeded.
- **Videos:** the reference refused video downloads with HTTP 403. No access controls were bypassed. Video entries show their poster and an explicit unavailable message. Authorized copies can be added later by updating `public/data/galleries.json` and removing `unavailable`.
- **Business links:** WhatsApp, phone, email, map and social destinations reflect the supplied reference. They are not configured as a new operational business account.
- The reference's proprietary animation/runtime logic is not included; standalone behavior is reconstructed.
- No original private source repository, CMS, admin dashboard, or database was available or inferred.

## Deployment

Source lives on `main`; built output lives on `gh-pages`. Run `npm run deploy` with GitHub Git authentication available. The script runs the tests, builds with `/teddypups-clone` as the base path, and pushes the generated site to `gh-pages`. GitHub Pages must be configured to publish the root of that branch. This avoids requesting the extra GitHub `workflow` token permission. For another host, run `npm run build` without `BASE_PATH` and deploy the generated `dist` directory.

This repository is an assignment reproduction. Reference branding and media remain attributable to their respective owners.
