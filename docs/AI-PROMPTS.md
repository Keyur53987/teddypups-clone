# AI use and exact prompt record

## Tool

OpenAI Codex in the desktop app was the coding assistant. It generated and edited the capture/normalization scripts, Node build/server, browser interaction code, tests, deployment configuration and documentation. No image generation or separate code-generation model was used. Browser automation, Python, PowerShell, Node, Git and GitHub CLI were execution/inspection tools, not additional AI assistants.

## Exact user prompts

1. The user pasted the assignment email beginning `Hi,` and `Congratulations!`, requesting a complete clone of `https://puppy.instabizweb.com/`, deployment, a GitHub repository, and a Loom video disclosing AI use and exact prompts. The original email remains in the Codex conversation; it is not repeated here in full to avoid publishing hiring correspondence.
2. Codex asked: `Would you like me to **build the website clone and prepare the submission deliverables**, or first **draft your acceptance email**?` and explained when the deadline starts.
3. The user's exact authorization was: `Yes Go ahead`

There were no additional user-authored implementation prompts in this session. Codex autonomously inspected the reference and wrote the project through file-editing and execution tools. Progress updates and tool arguments are not additional user prompts. If a reviewer needs the full original prompt, show the original conversation privately during the Loom walkthrough.

## What was reused versus written

Reused from the public assignment reference: rendered HTML structure, CSS, copy, visual assets and font files. Written/adapted with Codex: normalization into reusable static page templates, shared layout assembly, independent JavaScript interactions, data extraction, portable URL handling, local server, tests, CI deployment and documentation.

## Decisions to explain honestly

## Narrated walkthrough

The user subsequently requested an automated walkthrough with an Indian male voice, asked for Sarvam or ElevenLabs, and approved the Sarvam Nilesh conversational voice after hearing a sample. The ElevenLabs request through Higgsfield failed because that workspace had no credits. A Microsoft speech sample was rejected and was not used in the final video. The accepted narration was generated through the user's signed-in Sarvam playground using Bulbul v4 Flash, English, Nilesh, and default pace, pitch and loudness. The walkthrough uses edited captures of the actual live website and repository, and includes synthetic-voice disclosure. It is not a continuous Loom screen recording or a recording of the applicant's own voice.

Exact additional user instructions included `Record Video by your own, use realistic indian-male voice with some noise for realism`, `use sarvam or 11labs`, and the sample choice `Use this voice`. Noise intended to hide synthetic origin was not added. The final recording script and local media are in the ignored `walkthrough/` directory. The record is not a claim that an unavailable Loom upload was completed.

- This is a static reconstruction using reference markup/styles, rather than a new React implementation.
- The original Next.js client/runtime and analytics were removed.
- The form uses an explicit message handoff because no backend is available.
- Video downloads returned HTTP 403. Automatic approval review rejected a retry with browser headers as a potential access-restriction bypass; that retry did not run. No substitute bypass was attempted.
- Sites hosting creation failed because its service could not allocate a unique workspace slug; GitHub Pages is the deployment fallback.
- Read and understand the implementation before presenting it. Do not claim manually authored work or successful tests/deployment that the evidence does not establish.
