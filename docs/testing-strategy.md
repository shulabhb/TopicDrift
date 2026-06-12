# Testing strategy — TopicDrift

## Unit testing strategy

**Tooling:** Vitest + jsdom + Testing Library

Focus areas:

- `src/types/settings.ts` — defaults, normalization, validation
- `src/services/storage.ts` — read/write merge behavior with mocked `browser.storage.local`
- `src/utils/result.ts` and analysis utilities — pure functions
- `src/analysis/drift-state-machine.ts` — sustained drift transitions
- React popup/options — render honest shell copy and settings interactions

Conventions:

- Tests live in `tests/unit/`
- Use `tests/setup.ts` for jest-dom matchers
- Mock Chrome APIs via `vi.stubGlobal('browser', ...)`

## Browser testing strategy

**Tooling:** Playwright

Foundation e2e checks read built artifacts in `.output/chrome-mv3/` after production build:

- manifest name/version
- permission allowlist
- host permissions scoped to Meet
- content script matches

Future e2e may load unpacked extensions with fixtures; not required for foundation milestone.

## Transcript replay strategy (future)

- Store synthetic caption fixtures under `tests/fixtures/transcripts/`
- Replay segments into analysis modules and worker without touching Meet DOM
- Validate sustained drift detection across scripted conversations
- Never commit real private meeting transcripts

## Google Meet manual testing strategy

Manual checks before release candidates:

1. Load unpacked extension from `.output/chrome-mv3`
2. Open `https://meet.google.com/` (or test meeting)
3. Confirm content script isolation (dev badge in development only)
4. Open popup on Meet tab → supported state
5. Open popup on non-Meet tab → unsupported state
6. Change options → reload popup/options → settings persist
7. Verify Meet UI is not visually broken

Future manual tests will add captions-enabled meetings and drift warnings.

## Fixture conventions

```
tests/fixtures/
  transcripts/   # synthetic replay files (future)
  html/          # minimal DOM snippets for adapter unit tests (future)
```

Use generated or anonymized data only.

## Regression expectations

- Permission regressions are release blockers
- Settings normalization regressions are high priority
- Analysis tuning may adjust thresholds but must keep sustained-vs-transient behavior

## CI checks

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. `npm ci`
2. `npm run generate:icons`
3. `npm run format:check`
4. `npm run lint`
5. `npm run typecheck`
6. `npm run test:run`
7. `npm run build`

## Definition of passing

- All CI steps green
- `npm run check` green locally
- No tests assert fictional implemented behavior
- Build output manifest matches privacy documentation
