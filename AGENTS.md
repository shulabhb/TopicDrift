# TopicDrift — Agent Guide

TopicDrift is a privacy-first Chrome extension that helps users keep online meetings aligned with their intended objective. Processing happens locally in the browser; v1 has no backend, authentication, or cloud AI.

## Current v1 scope

Implemented:

- WXT + React + TypeScript Manifest V3 extension
- Google Meet lifecycle detection and content-script UI orchestration
- Tracking offer, objective capture, and local session persistence
- Popup and options surfaces with honest non-analysis copy
- Typed settings, sessions, and message routing
- Adapter/analysis/service boundaries (analysis remains stubbed)
- Unit tests, Playwright manifest smoke test, GitHub Actions CI

Not implemented:

- Caption observation
- Topic drift detection and warnings
- Post-meeting summaries

## Explicit non-goals (v1)

Do **not** implement unless a task explicitly requests it:

- Google Meet caption extraction or DOM scraping beyond detection stubs
- Topic drift detection beyond placeholder analysis utilities
- Backend, sync, accounts, or cloud AI APIs
- Audio/microphone capture
- Raw transcript persistence by default
- Analytics, telemetry, or remote JavaScript
- Zoom, Teams, or other platform adapters beyond interface stubs
- Redux, Tailwind, or large UI frameworks

## Architecture boundaries

| Layer             | Responsibility                                              | Must not depend on             |
| ----------------- | ----------------------------------------------------------- | ------------------------------ |
| `entrypoints/`    | Chrome entry surfaces (background, content, popup, options) | Host-page DOM in popup/options |
| `src/adapters/`   | Platform-specific meeting detection and caption observation | React, analysis algorithms     |
| `src/analysis/`   | Drift scoring, normalization, state machine                 | Chrome APIs, DOM, React        |
| `src/components/` | Reusable UI for in-meeting overlays and summaries           | Google Meet selectors          |
| `src/services/`   | Storage, messaging, session orchestration                   | Platform-specific DOM          |
| `src/workers/`    | CPU-bound analysis off the main thread                      | DOM                            |

**Adapter rule:** All Google Meet DOM selectors live in `src/adapters/google-meet/selectors.ts`.

**Analysis rule:** Analysis code must remain independent from browser APIs and meeting-platform DOM.

## Directory responsibilities

- `entrypoints/background.ts` — installation handling, typed message routing
- `entrypoints/content/` — isolated Meet page shell; future tracking UI mount point
- `entrypoints/popup/` — extension popup; page support state, links to options
- `entrypoints/options/` — local user settings
- `src/types/` — shared contracts (settings, messages, drift, transcript, meeting)
- `src/adapters/` — `MeetingAdapter` implementations per platform
- `src/analysis/` — local drift engine and text utilities
- `src/services/` — storage, messaging, session lifecycle
- `tests/unit/` — Vitest unit and component tests
- `tests/e2e/` — Playwright checks against build artifacts
- `docs/` — product, architecture, privacy, testing, release, ADRs

## Coding standards

- Production-quality TypeScript with strict typing; no `any` without justification
- Small, reviewable diffs focused on one concern
- Match existing naming, file layout, and import style
- Placeholder code must say **TODO** and describe future responsibility
- Do not invent completed functionality or misleading UI copy
- Prefer plain CSS / CSS modules for UI; avoid new styling frameworks unless documented

## TypeScript rules

- Enable and preserve strict compiler options
- Use explicit interfaces/types in `src/types/` for cross-layer contracts
- Prefer discriminated unions for extension messages
- Use `import type` for type-only imports
- Path alias `@/` maps to the project root (WXT default); import app code as `@/src/...`

## React rules

- Functional components only
- Keep popup/options logic thin; delegate to `src/services/`
- Ensure accessible labels, roles, and live regions for dynamic status
- Isolate in-meeting UI from host CSS via shadow roots (WXT `createShadowRootUi`)

## Chrome extension rules

- Manifest V3 only
- Request minimal permissions; document and justify any new permission in `docs/privacy-model.md` and `docs/decisions.md`
- No remote code, CDN scripts, or API keys
- Content scripts match only declared host permissions
- Background worker handles cross-context coordination; avoid heavy work there

## Privacy and security invariants

1. **Never log transcript contents in production** — use `src/utils/logger.ts`; sensitive keys are redacted
2. **No network request may carry meeting content** — no transcript/objective upload in v1
3. **No raw transcript persistence by default** — summaries/settings only as documented
4. **Explicit user consent** before caption observation or tracking starts
5. **Local-only processing** — analysis stays in extension contexts/workers

## Testing expectations

- Add or update tests for behavior you implement
- Unit tests: settings, analysis utilities, services, React surfaces
- E2E smoke tests: manifest permissions and build artifacts
- Do not add vacuous tests that only assert constants
- Run `npm run check` before considering a task done

## Git and commit expectations

- Do not commit unless the user asks
- Use clear, purpose-focused commit messages
- Update `CHANGELOG.md` for user-visible behavior changes
- Update `docs/decisions.md` for meaningful architectural decisions

## Documentation maintenance

When making substantive changes, update:

- `docs/architecture.md` — if runtime structure or data flow changes
- `docs/privacy-model.md` — if data handling or permissions change
- `docs/testing-strategy.md` — if test approach changes
- `docs/decisions.md` — ADR entries for architectural choices
- `CHANGELOG.md` — user-visible changes
- `README.md` — setup or scope changes

## Definition of done (task)

A task is done when:

1. Code matches the requested scope without hidden extras
2. Types, privacy rules, and permissions remain intact
3. Tests cover new behavior meaningfully
4. `npm run check` passes locally
5. Docs/ADRs/changelog updated when applicable
6. No feature is falsely represented as complete

## Before modifying code

1. Read relevant files in the area you are changing
2. Read `docs/architecture.md` and `docs/privacy-model.md`
3. Identify the correct layer (adapter, analysis, service, entrypoint)
4. Confirm the change does not leak platform logic into analysis or vice versa

## Keep changes small and testable

- Prefer incremental PR-sized slices
- Land interfaces before implementations
- Wire one runtime path at a time (e.g., settings before caption pipeline)
