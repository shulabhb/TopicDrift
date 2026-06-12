# Privacy model — TopicDrift

## Data categories

| Category                | Examples                                   | Sensitivity |
| ----------------------- | ------------------------------------------ | ----------- |
| Meeting transcript text | Live captions, speaker labels              | High        |
| Meeting objective       | User-entered purpose                       | High        |
| Drift analytics         | Scores, key terms, durations               | Medium      |
| User settings           | Sensitivity, auto-offer, retention toggles | Low         |
| Technical metadata      | Meet page state, meeting key, tab IDs      | Low         |

## What is processed

- Meet page lifecycle state via adapter-local DOM and URL heuristics
- User settings values for extension behavior
- User-entered meeting objectives after explicit submission
- Visible Google Meet captions after explicit caption consent (in-memory only)
- **Not processed:** audio, microphone streams, chat messages, participant lists outside caption context

## What is stored

### Current release

- `userSettings` in `browser.storage.local`
- `meetingSessions` keyed by normalized `meetingKey` (Meet room code only)
- `offerSuppression` keyed by `meetingKey` for per-meeting offer decline/dismiss
- `captionConsent` on each session (`not-requested`, `declined`, `granted`, `revoked`)

### Meeting key approach

TopicDrift derives a local `meetingKey` from the Meet room path segment only, for example `abc-defg-hij` from `https://meet.google.com/abc-defg-hij`.

Stored intentionally:

- Normalized room code (`meetingKey`)
- Local session ID
- Objective text (after user submission)
- Session status timestamps

Not stored:

- Full Meet URLs
- URL query parameters
- Participant identities
- Raw transcript/caption text (segments remain in memory only during active observation)

### In-memory transcript handling

Normalized caption segments exist only in the content-script runtime while observation is active. They are cleared on pause, stop, meeting end, room navigation, or content-script unload. No transcript segments are written to `browser.storage.local` by default.

### Retention behavior

When `deleteTemporarySessionDataAfterMeeting` is `true` (default), session and offer-suppression records for a meeting are removed when TopicDrift detects the call has ended or the user leaves.

When `false`, ended session metadata may remain locally for future summary support. No meeting-history UI is exposed in this phase.

## What is not stored

- Raw transcript logs
- Audio recordings
- Full meeting URLs
- User accounts or authentication tokens
- Cloud copies of meeting content

## Local-only processing requirements

- Lifecycle detection and session management occur inside the extension
- No `fetch`/XHR/WebSocket transmission of meeting content in v1

## Network restrictions

- No analytics endpoints
- No remote model inference
- No CDN-hosted executable scripts
- No API keys in the repository or extension package

## Logging restrictions

Use `src/utils/logger.ts`:

- Redact `text`, `normalizedText`, `transcript`, `segments`, `caption`, `objective`, `speaker`, `url`, `meetingUrl`, `meetingKey`
- Avoid verbose string dumps in production
- Debug logs may report lifecycle state names only

## User consent requirements

1. Installing the extension does **not** start tracking
2. Visiting Meet does **not** start caption observation
3. Automatic offers appear only after stable in-meeting detection and respect `autoOfferTracking`
4. Objective capture requires explicit user action (`Set objective` / popup start)
5. Caption observation requires a **separate** explicit consent step (`Enable caption tracking`)
6. Topic drift analysis is not active in this phase

## Data deletion behavior

- `deleteTemporarySessionDataAfterMeeting` clears session and suppression data after meeting end when enabled
- `Stop tracking` ends the current session locally
- Uninstalling the extension removes `browser.storage.local` entries

## Chrome permission rationale

| Permission                         | Why needed                                                |
| ---------------------------------- | --------------------------------------------------------- |
| `storage`                          | Persist settings, sessions, and offer suppression locally |
| `https://meet.google.com/*` (host) | Inject isolated content script on Google Meet pages       |

### Removed permission

| Permission  | Why removed                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `activeTab` | Popup state now comes from content-script lifecycle cache via background messaging; host permission covers Meet tabs |

### Explicitly not requested (v1)

- `microphone`, `tabCapture` — no audio capture
- `tabs` — no broad tab access; tab association uses message sender metadata and active-tab lookup without persistent URL access
- `history` — unnecessary URL access
- `webRequest` — no network interception
- `<all_urls>` — platform scope limited to Meet

## Threat considerations

| Threat                       | Mitigation                                                      |
| ---------------------------- | --------------------------------------------------------------- |
| Accidental data exfiltration | No network code paths for meeting payloads                      |
| Overbroad permissions        | Manifest limited to `storage` + Meet host                       |
| Host CSS/script interference | Shadow DOM isolation                                            |
| Sensitive logs               | Logger redaction and production debug suppression               |
| Misleading UX                | Widget reports caption state honestly; no drift/analysis claims |

## Privacy acceptance checklist

- [x] Minimal permissions documented
- [x] Settings and sessions stored locally only
- [x] Meeting keys exclude full URLs and query strings
- [x] Logger redacts transcript and objective fields
- [x] No analytics or third-party SDKs
- [x] No remote JavaScript
- [x] Explicit opt-in before objective capture
- [x] Session retention honors user settings on meeting end
- [x] Explicit opt-in before caption observation
- [ ] Manual privacy review before Chrome Web Store submission (future)
