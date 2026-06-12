Synthetic DOM fixtures for Google Meet lifecycle testing live in `tests/fixtures/html/`.

## Usage

- `meet-dom-fixtures.ts` — sanitized HTML snippets imported by Vitest adapter tests
- `meet-lifecycle.html` — optional local manual harness page (not shipped in the extension)

## Conventions

- Use structural attributes (`data-call-toolbar`, `data-participant-id`, `role`) only
- Never commit real private meeting HTML or transcripts
- Keep fixtures minimal — only the nodes required by lifecycle heuristics

## Developer testing without a live call

1. Run unit tests: `npm run test:run -- lifecycle-detector`
2. Load the unpacked extension and join a Meet call for manual verification
3. In development builds, the content script shows the current lifecycle state badge when no UI prompt is visible

Caption and drift fixtures will be added under `tests/fixtures/transcripts/` in a later milestone.
