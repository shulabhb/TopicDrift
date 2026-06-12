# Contributing to TopicDrift

Thank you for helping build a privacy-first meeting companion.

## Setup

```bash
git clone <repository-url>
cd topic-drift
npm install
npm run generate:icons
```

## Branch and commit guidance

- Use focused branches per feature or fix
- Keep commits small and descriptive
- Do not commit secrets, API keys, or real meeting transcripts
- Update `CHANGELOG.md` for user-visible changes
- Add ADR entries to `docs/decisions.md` for architectural decisions

## Quality requirements

Before opening a pull request:

```bash
npm run check
```

Optional when touching manifest/build:

```bash
npm run test:e2e
```

## Pull request expectations

- Describe scope and link related issues
- Note permission or privacy implications
- Include tests for behavior changes
- Avoid unrelated refactors
- Ensure UI does not overstate implemented functionality

## Documentation expectations

Update docs when you change:

- Runtime architecture → `docs/architecture.md`
- Data handling → `docs/privacy-model.md`
- Test approach → `docs/testing-strategy.md`
- Release steps → `docs/release-checklist.md`

## Privacy review expectations

Reviewers should verify:

- No meeting content in logs or network calls
- Permissions remain minimal and documented
- Settings defaults align with `docs/privacy-model.md`
- New storage fields have retention rationale

Read [AGENTS.md](AGENTS.md) for layer boundaries and invariants.
