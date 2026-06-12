# Privacy model — TopicDrift

## Data categories

| Category                | Examples                                   | Sensitivity |
| ----------------------- | ------------------------------------------ | ----------- |
| Meeting transcript text | Live captions, speaker labels              | High        |
| Meeting objective       | User-entered purpose                       | High        |
| Drift analytics         | Scores, key terms, durations               | Medium      |
| User settings           | Sensitivity, auto-offer, retention toggles | Low         |
| Technical metadata      | URLs, install reason, content-script ready | Low         |

## What is processed

- Page URL hostname/path to determine support (Google Meet)
- User settings values for extension behavior
- **Future:** caption text and objective text locally for drift analysis

## What is stored

### v1 foundation

- `userSettings` in `browser.storage.local` only

### v1 target (future tasks)

- Optional meeting summaries (if user enables)
- Temporary session metadata (if user does not delete after meeting)
- Never raw transcript archives by default

## What is not stored

- Raw transcript logs in persistent storage by default
- Audio recordings
- User accounts or authentication tokens
- Cloud copies of meeting content

## Local-only processing requirements

- Caption normalization, similarity scoring, and drift state transitions occur inside extension contexts
- Worker threads may process transcript slices in memory
- No `fetch`/XHR/WebSocket transmission of meeting content in v1

## Network restrictions

- No analytics endpoints
- No remote model inference
- No CDN-hosted executable scripts
- No API keys in the repository or extension package

## Logging restrictions

Use `src/utils/logger.ts`:

- Redact `text`, `normalizedText`, `transcript`, `segments`, `caption`, `objective`, `speaker`
- Avoid verbose string dumps in production
- Debug logs may be suppressed in production builds

## User consent requirements

1. Installing the extension does **not** start tracking
2. Visiting Meet does **not** start caption observation automatically in production
3. Future tracking requires explicit user activation and objective confirmation
4. Settings clearly describe local retention behavior

## Data deletion behavior

- `deleteTemporarySessionDataAfterMeeting` (default `true`) will clear in-memory session artifacts when implemented
- Users can disable local summary saving
- Uninstalling the extension removes `browser.storage.local` entries

## Chrome permission rationale

| Permission                         | Why needed                                                       |
| ---------------------------------- | ---------------------------------------------------------------- |
| `storage`                          | Persist local user settings                                      |
| `activeTab`                        | When user opens popup, read active tab URL to show support state |
| `https://meet.google.com/*` (host) | Inject isolated content script on Google Meet pages              |

### Explicitly not requested (v1)

- `microphone`, `tabCapture` — no audio capture
- `history` — unnecessary URL access
- `webRequest` — no network interception
- `<all_urls>` — platform scope limited to Meet

## Threat considerations

| Threat                       | Mitigation                                          |
| ---------------------------- | --------------------------------------------------- |
| Accidental data exfiltration | No network code paths for transcript payloads       |
| Overbroad permissions        | Manifest review + documented rationale              |
| Host CSS/script interference | Shadow DOM isolation                                |
| Sensitive logs               | Logger redaction and production debug suppression   |
| Misleading UX                | Disabled controls / honest copy until features ship |

## Privacy acceptance checklist

- [x] Minimal permissions documented
- [x] Settings stored locally only
- [x] Logger redacts transcript fields
- [x] No analytics or third-party SDKs
- [x] No remote JavaScript
- [ ] Explicit opt-in before caption observation (future)
- [ ] Session retention honors user settings (future)
- [ ] Manual privacy review before Chrome Web Store submission (future)
