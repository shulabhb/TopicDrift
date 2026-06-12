# Testing strategy — TopicDrift

## Unit testing strategy

**Tooling:** Vitest + jsdom + Testing Library

Focus areas:

- `src/adapters/google-meet/` — lifecycle classification, diagnostics, caption parser/observer
- `src/adapters/google-meet/meeting-key.ts` — room code normalization
- `src/services/session-transitions.ts` — create/pause/resume/stop/edit and caption consent
- `src/services/offer-policy.ts` — stable in-meeting gating and suppression
- `src/services/transcript-ingest.ts` — normalization, deduplication, partial updates
- `src/services/session-storage.ts` — settings/session persistence behavior
- `src/services/background-handlers.ts` — typed popup/session/caption messaging
- React components — objective form, caption consent, tracking widget, popup states

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
  meet-dom-fixtures.ts   # landing, prejoin, in-meeting, caption snippets
  meet-lifecycle.html    # optional manual harness (not shipped)
```

Never commit real private meeting HTML or transcripts.

## Google Meet manual testing strategy

1. Load unpacked extension from `.output/chrome-mv3` (or dev build)
2. Open Meet landing page → diagnostics show `landing`; no in-meeting offer
3. Open prejoin room → diagnostics show `prejoin`; no offer until in-call controls appear
4. Enter active call → offer appears after brief stability (if auto-offer enabled)
5. Set objective → widget shows objective; caption consent prompt appears
6. Decline caption consent → observation does not start
7. Grant caption consent with Meet captions on → widget shows captions detected
8. Grant consent with captions off → widget shows waiting-for-captions guidance
9. Pause tracking → caption observation stops; paused state shown
10. Refresh tab → session and caption consent recover; segments are not duplicated from storage
11. Stop tracking or leave call → session ends and observation stops
12. Popup shows accurate caption-tracking state

Development builds show lifecycle diagnostics and transcript monitor counters when no prompt is visible. Diagnostics never show objective text, URLs, meeting codes, or participant info.

## CI checks

GitHub Actions workflow runs format, lint, typecheck, unit tests, and build.

## Definition of passing

- All CI steps green
- `npm run check` green locally
- 69+ unit tests passing
- Build manifest matches privacy documentation
- Tests verify caption consent gating and honest non-analysis UI copy
- No tests claim drift analysis is implemented
