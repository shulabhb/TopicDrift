# Architecture decision log

This log records meaningful architectural decisions using a lightweight ADR style.

## ADR-0001 — Use WXT for the extension toolchain

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

TopicDrift needs Manifest V3, React UI, TypeScript, hot reload, and cross-browser-capable builds without maintaining bespoke Rollup/webpack configuration.

### Decision

Use [WXT](https://wxt.dev/) as the extension framework with `@wxt-dev/module-react`.

### Consequences

- File-based entrypoints map cleanly to MV3 surfaces
- Faster iteration via WXT dev server and `wxt prepare` typing
- Team must follow WXT conventions for entrypoints and manifest merging

---

## ADR-0002 — Google Meet captions first

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

v1 needs a single supported platform with accessible text for local analysis. Audio capture increases privacy risk and permission scope.

### Decision

Support Google Meet in Chrome first, reading live captions from the DOM after explicit user activation. No microphone capture in v1.

### Consequences

- Users must enable Meet captions
- DOM selectors are brittle and must be adapter-local
- Zoom/Teams come later via new adapters

---

## ADR-0003 — No backend in v1

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Meeting transcript data is highly sensitive. A backend would introduce custody, compliance, and availability burdens.

### Decision

v1 runs entirely in the browser extension with `browser.storage.local` for settings (and optional summaries later).

### Consequences

- No cross-device sync or accounts
- Simpler privacy story and fewer operational dependencies
- Heavier client-side analysis requires worker offloading

---

## ADR-0004 — Lightweight local analysis engine first

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Cloud LLMs conflict with privacy-first goals and would require keys, networking, and ongoing cost.

### Decision

Start with local lexical methods (normalization, TF-IDF/similarity, rolling window, sustained drift state machine) in `src/analysis/`.

### Consequences

- Lower operational complexity and no API keys
- May require tuning for false positives/negatives
- Future on-device models would need a new ADR

---

## ADR-0005 — Platform adapters behind `MeetingAdapter`

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Meet, Zoom, and Teams differ in DOM, lifecycle, and caption surfaces. Mixing platform logic into analysis or UI creates unmaintainable coupling.

### Decision

Introduce `MeetingAdapter` with per-platform implementations (Google Meet first). Centralize Meet selectors in `src/adapters/google-meet/selectors.ts`.

### Consequences

- Analysis and UI remain platform-agnostic
- Adding a platform means a new adapter folder + permission review
- Adapter tests can use fixture DOM snippets

---

## ADR-0006 — Google Meet lifecycle detection via multi-signal adapter

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

TopicDrift must distinguish Meet landing pages, prejoin lobbies, and active calls without falsely offering tracking on the home page. Meet is a single-page app with brittle generated class names.

### Decision

Detect lifecycle state in `src/adapters/google-meet/` using combined URL structure and structural DOM signals (toolbars, hangup controls, participant tiles, prejoin preview/join controls). Emit observations through a `MutationObserver`-backed detector instead of UI polling.

### Consequences

- Selectors remain adapter-local and fixture-testable
- Heuristics may need tuning as Meet changes
- English button labels are supplemental only, not primary selectors

---

## ADR-0007 — Local session and objective persistence

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Users need recoverable tracking state across tab refresh without uploading meeting content.

### Decision

Persist `MeetingSession` records and per-meeting offer suppression in `browser.storage.local`, keyed by a normalized Meet room code (`meetingKey`). Store objective text only after explicit user submission. Honor `deleteTemporarySessionDataAfterMeeting` by clearing session and suppression artifacts when a meeting ends.

### Consequences

- No full URLs or query strings are stored
- Session transitions are centralized in `session-transitions.ts` and `session-storage.ts`
- Future summaries can reuse stopped/ended metadata if retention is enabled

---

## ADR-0008 — Per-meeting offer suppression

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Automatic offers must be helpful without nagging users who declined tracking for a specific meeting.

### Decision

`Not now` and dismiss actions suppress the automatic offer for the current `meetingKey` until the meeting ends. Users can still start setup manually from the popup. Offers require a stable `in-meeting` state for 2 seconds and respect `autoOfferTracking`.

### Consequences

- Suppression is local and meeting-scoped
- Popup manual start remains available after suppression
- No browser notifications are used

---

## ADR-0009 — Explicit opt-in before any analysis

- **Date:** 2025-06-12
- **Status:** Accepted (updated 2025-06-12)

### Context

Privacy requirements mandate consent before reading captions or scoring conversation alignment.

### Decision

Objective capture and session state require explicit user action. Caption observation requires a **separate** consent step after an active session exists. Drift scoring remains unimplemented. UI copy must state that topic drift analysis is not active.

### Consequences

- Caption text is ingested in memory only after `captionConsent === 'granted'`
- Widget and popup report caption-tracking state without drift claims
- Next milestone is drift engine wiring, not additional consent work

---

## ADR-0010 — DOM captions over audio capture

- **Date:** 2025-06-12
- **Status:** Accepted

### Context

Audio capture would require additional permissions (`microphone`, `tabCapture`) and increase privacy risk.

### Decision

Read visible Google Meet captions from the DOM using the existing Meet host permission and content script. Do not request microphone or tab audio permissions in v1.

### Consequences

- Users must enable Meet captions manually
- Caption selectors remain adapter-local and may require ongoing maintenance
- Transcript ingestion stays in the content script with in-memory segments only
