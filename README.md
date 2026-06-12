# TopicDrift

Private, local topic-alignment tracking for online meetings.

TopicDrift is a privacy-first Chrome extension that helps you notice when a browser-based meeting sustains off-topic discussion relative to your stated objective. v1 processes meeting text locally in the browser and does not upload transcripts to a server.

## Current project status

**Objective/session milestone** — Google Meet lifecycle detection, tracking offer, objective capture, and recoverable local sessions.

Implemented today:

- Meet lifecycle detection (`landing`, `prejoin`, `in-meeting`, `leaving`, `ended`)
- Automatic tracking offer with per-meeting suppression
- Explicit objective form and local session persistence
- In-meeting widget with pause/resume/edit/stop controls
- Popup actions for setup, resume, and open-controls
- Typed background/content messaging and session storage
- DOM fixtures and expanded unit test coverage

Not implemented yet:

- Caption observation / scraping
- Topic drift detection and warnings
- Post-meeting summaries

## v1 scope (target)

Google Meet in Chrome with live captions enabled; local analysis; private warnings; optional local summaries. See [docs/product-requirements.md](docs/product-requirements.md).

## Privacy posture

- No backend, accounts, or cloud AI in v1
- Minimal permissions: `storage` and `https://meet.google.com/*`
- No raw transcript persistence by default
- Logger redacts sensitive meeting fields

Details: [docs/privacy-model.md](docs/privacy-model.md)

## Technology stack

- WXT, React, TypeScript, Manifest V3
- Vitest, Playwright, ESLint, Prettier
- npm, Git, GitHub Actions

## Local development

```bash
npm install
npm run generate:icons
npm run dev
```

WXT prints the path to the development build (typically `.output/chrome-mv3-dev`).

### Load unpacked in Chrome

1. Run `npm run dev` (or `npm run build` for production output in `.output/chrome-mv3`).
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the WXT output directory shown in the terminal.
6. Open `https://meet.google.com/` to verify the content script shell (dev badge in development builds only).

## Available scripts

| Script                            | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `npm run dev`                     | Start WXT dev server / watcher                   |
| `npm run build`                   | Production extension build                       |
| `npm run zip`                     | Create distributable ZIP                         |
| `npm run typecheck`               | TypeScript `--noEmit`                            |
| `npm run lint`                    | ESLint                                           |
| `npm run format` / `format:check` | Prettier                                         |
| `npm run test` / `test:run`       | Vitest                                           |
| `npm run test:e2e`                | Playwright manifest smoke tests (requires build) |
| `npm run check`                   | format + lint + typecheck + unit tests + build   |
| `npm run generate:icons`          | Generate temporary dev PNG icons                 |

## Testing

```bash
npm run test:run
npm run build && npm run test:e2e
npm run check
```

Strategy: [docs/testing-strategy.md](docs/testing-strategy.md)

## Repository architecture

```
entrypoints/     Chrome surfaces (background, content, popup, options)
src/             Domain logic (adapters, analysis, services, components, types)
tests/           Unit and e2e tests
docs/            Product, architecture, privacy, testing, ADRs
public/icons/    Extension icons (temporary dev assets)
```

Agent and contributor guide: [AGENTS.md](AGENTS.md)

## Icons

Icons under `public/icons/` are **temporary development assets** (simple geometric placeholders). Replace before Chrome Web Store release.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

TBD.
