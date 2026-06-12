# Product requirements — TopicDrift v1

## Product problem

Online meetings frequently drift away from their intended purpose. Participants may not notice gradual topic shifts until time is lost. Existing tools focus on recording, transcription services, or manager visibility—not private, real-time alignment feedback for the individual participant.

## Target user

Knowledge workers and team leads who join browser-based meetings and want a private reminder when discussion sustains off-objective topics.

## Primary use case

A user joins a Google Meet with live captions enabled, sets a meeting objective, and receives discreet private warnings when the conversation sustains away from that objective—without sending meeting content to a server.

## Complete v1 user flow (target)

1. User installs TopicDrift from the Chrome Web Store (or loads unpacked in development).
2. User opens a Google Meet URL.
3. TopicDrift detects a supported meeting page and offers tracking (if enabled in settings).
4. User explicitly opts in and provides or confirms a meeting objective.
5. After opt-in, TopicDrift reads live captions from the Meet UI locally.
6. Transcript text is normalized and analyzed in-browser.
7. When sustained drift is detected, TopicDrift shows a private warning only to the user.
8. User may dismiss, mark as relevant detour, update objective, or pause tracking.
9. After the meeting, TopicDrift may generate a local summary if the user enabled saving summaries.
10. Temporary session data is cleared according to user settings.

**Current status:** Steps 1–4 and session management are implemented. Steps 5–10 (captions, analysis, drift warnings, summaries) are not implemented.

## Functional requirements

| ID    | Requirement                                             | Foundation status                    |
| ----- | ------------------------------------------------------- | ------------------------------------ |
| FR-1  | Detect supported meeting pages (Google Meet)            | Implemented — lifecycle states |
| FR-2  | Offer tracking after detection                          | Implemented                    |
| FR-3  | Capture meeting objective with user consent             | Implemented                    |
| FR-4  | Read live captions after explicit activation            | Not implemented                      |
| FR-5  | Analyze transcript locally                              | Stub only                            |
| FR-6  | Detect sustained drift vs isolated tangents             | Stub only                            |
| FR-7  | Show private drift warnings                             | Not implemented                      |
| FR-8  | Allow dismiss / detour / objective update / pause       | Partial — pause/edit/stop; no drift detours yet |
| FR-9  | Optional local post-meeting summary                     | Not implemented                      |
| FR-10 | Persist user settings locally                           | Implemented                          |
| FR-11 | Popup shows support state without false analysis claims | Implemented                          |
| FR-12 | Options page for privacy-relevant preferences           | Implemented                          |

## Non-functional requirements

- **Privacy-first:** No cloud processing of meeting content in v1
- **Local-first:** Analysis in extension contexts / web worker
- **Performance:** Caption observation must not freeze Meet UI; heavy work off main thread
- **Security:** Minimal permissions, no remote code
- **Accessibility:** Keyboard reachable controls, labels, live regions
- **Maintainability:** Typed modules with adapter/analysis separation
- **Reliability:** Safe fallbacks for settings load/save failures

## Explicit v1 exclusions

- Zoom, Microsoft Teams, Slack huddles
- Backend accounts, sync, or team dashboards
- Cloud speech-to-text or LLM APIs
- Microphone/audio capture
- Automatic recording or transcript export by default
- Manager/moderator visibility into other participants
- Mobile browsers

## Error and empty states

| State                 | Expected UX                                                  |
| --------------------- | ------------------------------------------------------------ |
| Unsupported page      | Popup reports page is not supported; no tracking CTA enabled |
| Settings load failure | Options shows error; defaults are not falsely shown as saved |
| Settings save failure | Options shows error status; previous values remain           |
| No active tab         | Popup reports no active tab                                  |
| Meet without captions | Future: explain captions must be enabled in Meet             |
| Tracking not started  | Disabled control or hint that analysis has not started       |

## Accessibility expectations

- Semantic headings and labels on popup/options
- `aria-live` for async status changes
- Sufficient color contrast for shell UI
- Future in-meeting controls must be keyboard operable and screen-reader friendly

## Definition of a usable v1

A usable v1 means a user can reliably opt into tracking on Google Meet, set an objective, receive accurate sustained-drift warnings with low false-positive rate, and review an optional local summary—without meeting transcript content leaving the device by default.

## Acceptance criteria (foundation milestone)

- [x] Extension builds and loads unpacked in Chrome
- [x] Manifest permissions limited to `storage` and `https://meet.google.com/*`
- [x] Meet lifecycle detection distinguishes landing/prejoin/in-meeting
- [x] Tracking offer respects settings and per-meeting suppression
- [x] Objective capture and session recovery work across refresh
- [x] Popup communicates support state honestly
- [x] Options persist settings locally with validation
- [x] Content script mounts isolated shell on Meet pages
- [x] CI runs format, lint, typecheck, tests, and build
- [ ] Caption observation after explicit consent (future milestone)
- [ ] Sustained drift detection with user controls (future milestone)
