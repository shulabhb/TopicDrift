# Security policy

## Reporting a vulnerability

If you discover a security issue, please report it privately to the maintainers (security contact email TBD). Do not open public issues for undisclosed vulnerabilities.

Include:

- Affected version
- Steps to reproduce
- Impact assessment (especially data exposure)
- Suggested mitigation if known

## Sensitive data categories

TopicDrift handles highly sensitive information:

- Live meeting captions / transcript text
- Meeting objectives
- Drift warnings and optional summaries

**Do not include real private meeting transcripts in issues, PRs, or test fixtures.**

## Secure development expectations

- Keep permissions minimal and documented
- Never log transcript or objective content in production
- Do not add network calls that transmit meeting content
- Redact sensitive fields in diagnostics
- Review adapter DOM access for scope creep

## Supported versions

| Version | Supported                            |
| ------- | ------------------------------------ |
| 0.1.x   | Best effort (pre-release foundation) |
| < 0.1.0 | Unsupported                          |

Update this table as releases ship.
