# Loom recording guide

The applicant should record this in their own voice and account after reviewing the code. This file is an outline, not a completed video or a fabricated Loom URL.

## Suggested 6–8 minute walkthrough

1. **Scope and demo (one minute).** Open the reference and deployed clone. Navigate the home page, catalog, a puppy profile, family gallery, FAQ, how-it-works and contact. Resize to a mobile width and open the menu.
2. **Approach and attribution (one minute).** Explain that the reference's publicly rendered markup, CSS and assets were adapted into self-contained templates, with standalone behavior rebuilt in JavaScript. State clearly what was reused. Explain why static generation is sufficient for this content-driven site and requires no server at runtime.
3. **Project structure (one minute).** Show `src/pages`, shared partials, `public/assets` and `public/data`. Open `scripts/build.mjs` and explain route generation, metadata and the deployment base path.
4. **Implementation (two minutes).** Show `src/client/app.js`: native mobile dialog; FAQ state and `inert`; tab keyboard controls; media viewer and index wraparound; catalog query-state synchronization; validation and enquiry handoff. Show the pure helpers and tests.
5. **AI disclosure (one minute).** Open `docs/AI-PROMPTS.md` and the Codex conversation. Explain that Codex assisted with code, terminal commands, browser inspection and documentation. Display the exact original assignment prompt and `Yes Go ahead`. Do not invent additional prompts or suggest the reference design was created by AI.
6. **Challenges and limits (one minute).** Explain streamed Next.js HTML normalization, replacing hydration-dependent behavior, self-hosting assets and GitHub project-path routing. Disclose unavailable videos and the lack of a backend. Demonstrate that the form prepares a message rather than claiming it was sent.
7. **Testing/deployment (one minute).** Run `npm test` and `npm run build`; show the GitHub Pages deployment, the `gh-pages` branch and the live URL. Explain that `npm run deploy` tests and builds before pushing the static output. Mention the checks actually recorded in `docs/VALIDATION.md`. Finish with the repository URL.

## Before recording

- Read the code and practice explaining a filter or gallery event from input to visible state.
- Use dummy details in the form; do not actually send an enquiry to the reference business.
- Hide email inboxes, tokens and unrelated windows.
- Verify the live page works in a private browser session.
- Record screen sharing and narration in Loom, check the replay, and set its sharing so the reviewer can access it.
- Add your real Loom URL to the submission email. A scripted outline is not a Loom deliverable.
