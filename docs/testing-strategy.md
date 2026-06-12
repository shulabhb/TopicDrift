# Testing strategy — TopicDrift

## Unit testing strategy

**Tooling:** Vitest + jsdom + Testing Library

Focus areas:

- `src/adapters/google-meet/` — lifecycle classification against sanitized DOM fixtures
- `src/adapters/google-meet/meeting-key.ts` — room code normalization
- `src/services/session-transitions.ts` — create/pause/resume/stop/edit validation
- `src/services/offer-policy.ts` — stable in-meeting gating and suppression
- `src/services/session-storage.ts` — settings/session persistence behavior
- `src/services/background-handlers.ts` — typed popup/session messaging
- React components — objective form, tracking widget, popup states

Conventions:

- Tests live in `tests/unit/`
- DOM fixtures live in `tests/fixtures/html/`
- Mock Chrome APIs via `vi.stubGlobal('browser', ...)`

## Browser testing strategy

**Tooling:** Playwright

E2E checks read built artifacts in `.output/chrome-mv3/`:

- manifest name/version
- permission allowlist (`storage` only + Meet host)
- content script matches

## Fixture conventions

```
tests/fixtures/html/
  meet-dom-fixtures.ts   # landing, prejoin, in-meeting snippets
  meet-lifecycle.html    # optional manual harness (not shipped)
```

Never commit real private meeting HTML or transcripts.

## Google Meet manual testing strategy

1. Load unpacked extension from `.output/chrome-mv3`
2. Open Meet landing page → no in-meeting offer
3. Join or open a prejoin room → no offer until in-call controls appear
4. Enter active call → offer appears after brief stability (if auto-offer enabled)
5. Set objective → widget shows “Objective set” without analysis claims
6. Refresh tab → session recovers
7. Stop tracking or leave call → session ends/suppresses as configured
8. Popup shows accurate state and manual setup works after offer suppression

Development builds show a small lifecycle state badge when no prompt is visible.

## CI checks

GitHub Actions workflow runs format, lint, typecheck, unit tests, and build.

## Definition of passing

- All CI steps green
- `npm run check` green locally
- 38+ unit tests passing
- Build manifest matches privacy documentation
- No tests claim caption or drift analysis are implemented
