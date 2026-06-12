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
