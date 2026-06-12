# Release checklist — TopicDrift

## Local quality checks

- [ ] `npm run check` passes
- [ ] `npm run test:e2e` passes after build (manifest smoke)
- [ ] No unintended dependency upgrades
- [ ] CHANGELOG updated for user-visible changes

## Production build

- [ ] `npm run build` succeeds without warnings that indicate misconfiguration
- [ ] `npm run zip` produces a store-ready archive (when releasing)
- [ ] Version in `package.json`, manifest, and UI align

## Manual Chrome loading

- [ ] Load unpacked from `.output/chrome-mv3`
- [ ] Extension icon and name display correctly
- [ ] Popup and options open without console errors
- [ ] Meet page loads with isolated TopicDrift shell

## Permissions review

- [ ] Permissions limited to `storage` and Meet host
- [ ] Host permission limited to `https://meet.google.com/*`
- [ ] No new permissions without ADR + privacy doc updates

## Privacy review

- [ ] Logger redaction verified
- [ ] No network calls carrying meeting content
- [ ] Options defaults match privacy model
- [ ] UI does not claim analysis is active when it is not

## Asset review

- [ ] Icons present at 16/32/48/128
- [ ] Temporary dev icons documented if not final brand assets
- [ ] No copyrighted third-party assets

## GitHub release preparation

- [ ] Tag matches semver version
- [ ] Attach `zip` artifact to GitHub release
- [ ] Release notes summarize user-visible changes

## Chrome Web Store preparation

- [ ] Store listing copy matches actual v1 capabilities
- [ ] Privacy policy describes local processing (when published)
- [ ] Screenshots reflect implemented features only
- [ ] Data use disclosures align with manifest permissions

## Post-release smoke testing

- [ ] Install published build in clean Chrome profile
- [ ] Popup/options functional
- [ ] Meet shell loads
- [ ] Settings persist across browser restart
