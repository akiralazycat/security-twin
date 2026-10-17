# Security Twin

**Explore, simulate and verify the resilience of your digital identity.**

Security Twin is a local-first security dependency simulator. A fictional sample illustrates phone, mailbox and recovery dependencies. A second **session-only abstract profile** asks only whether an independent alternate login and an independent recovery method exist (yes/no/unknown). Neither mode asks for passwords, service names or recovery codes, and both share one deterministic engine.

> **Status (2026-10-17):** Phase 1, Phase 2a and Phase 2b are merged into main. Next.js 16.4.2 security dependency upgrade is merged (PR #5) and deployed together with the Phase 2b session-only experience. Actual iPhone Safari / VoiceOver QA, personal identifiers, model persistence and encrypted storage remain out of scope.

## Run locally (Node 22 or 24)

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

The test suite covers 12 engine cases, 6 fictional examples, 6 abstract profile cases, and 3 clarity cases. On this branch `npm test` is **27/27**, with typecheck and production build passing. The earlier Phase 2b cloud run was 24/24, including axe at 320/390/1280; axe was not rerun for the added simulation copy. Chromium on this branch confirmed the existing atlas still renders, lost-phone login stays unreachable, and the cascade plus three unperformed checks appear, with no storage and no horizontal overflow at 390px. Real iPhone Safari/VoiceOver verification is still pending; see [Progress & handoff](docs/PROGRESS.md).

## Repository map

- `src/engine.ts` — pure typed three-valued access/recovery evaluator, candidate cloning and explanations.
- `src/demo.ts` — fictional guest account example, scenario changes and hypothetical spare-key comparison.
- `src/profile.ts` — pure session-only abstract user choices, tri-state paths, separate hypothetical candidate and explicit self-reported evidence.
- `src/clarity.ts` — simulation cascade wording and the three unperformed real-world checks. It does not score or change the engine.
- `components/SecurityWorkspace.tsx` — interactive graph, accessible list, status detail, results and scenario controls.
- `app/` — Next.js 16 App Router shell and Security Twin-specific responsive UI styles.
- `tests/` — synthetic engine and guest fixture tests.

No login, cloud database, AI request, secret import, real provider integration or user graph persistence is present in this branch. **Never enter passwords or recovery codes here.** Browser storage alone is not a safe encryption boundary: real data storage must pass the recorded threat review first.

## Documentation

- [Master plan](docs/MASTER_PLAN.md) — mission, product differentiation, Phases 0–6 and release gates.
- [Domain model](docs/DOMAIN_MODEL.md) — graph semantics, actor distinction, known/unknown and scenario assumptions.
- [Phase 2 design](docs/PHASE2_DESIGN.md) — UX reference principles, copy and accessibility acceptance.
- [Phase 2b privacy decision](docs/PHASE2B_PRIVACY.md) — session-only data policy, storage threat review gate and verified behaviors.
- [Progress & handoff](docs/PROGRESS.md) — verified state, commits, tests, Vercel target and next action.

**Security dependencies:** upgrade tested using Next.js 16.4.2, with patched PostCSS 8.5.23 (`npm audit --omit=dev --audit-level=moderate`: 0 vulnerabilities). Previous Next 15/PostCSS lockfile had a high and moderate warning. Security-only branch preserves React and domain engine behavior. Original [PR #3](https://github.com/akiralazycat/security-twin/pull/3) supplied the patch; this branch reapplies it to current main without reverting Phase 2b.

**Hosting:** [Security Twin on Vercel](https://security-twin-sphereorb.vercel.app) (deployment `dpl_HtfTZjyPNQ2dtWXznZ1Azuh5Fuuu`, READY; Vercel Authentication protection enabled). The manually deployed `main` commit `6f783176f50b78233ca7136f86480d983faf66e7` is assigned the **production** target; the repository is not connected for Git-triggered auto deployments, and automatic preview deployments are disabled. Real-device Safari/VoiceOver QA remains open. No GitHub Actions needed.

## License

[MIT](LICENSE) for software in this repository. Future public datasets and third-party contributions require their own license review.
