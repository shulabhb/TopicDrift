# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Google Meet lifecycle detection (`landing`, `prejoin`, `in-meeting`, `leaving`, `ended`)
- Privacy-safe meeting key derivation from Meet room path only
- Automatic tracking offer with per-meeting suppression (`Not now` / dismiss)
- Explicit meeting objective form (max 500 characters)
- Local session persistence with pause, resume, edit, and stop actions
- In-meeting tracking widget with honest non-analysis status copy
- Popup integration for setup, resume, and open-controls actions
- Typed background/content messaging for meeting and session state
- DOM fixtures and unit tests for detector, sessions, offers, and UI

### Changed

- Removed `activeTab` permission; popup state now comes from content-script/background cache
- Replaced placeholder popup tracking button with real Meet/session states

### Notes

- Caption observation and drift analysis remain **not implemented**.

## [0.1.0] - 2025-06-12

### Added

- Project foundation with WXT, React, TypeScript, Manifest V3
- Background service worker with typed message routing
- Popup shell showing page support state and privacy-first copy
- Options page with locally persisted settings
- Google Meet content script with isolated shadow-root shell
- Adapter, analysis, services, and type scaffolding
- Vitest unit tests, Playwright manifest smoke test, GitHub Actions CI
- Product, architecture, privacy, testing, and ADR documentation
- Temporary development icons

### Notes

- Caption observation, drift detection, and meeting summaries were **not** implemented in this release.

[Unreleased]: https://github.com/shulabhb/TopicDrift/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/shulabhb/TopicDrift/releases/tag/v0.1.0
