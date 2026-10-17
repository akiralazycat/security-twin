# Security Twin

**Explore, simulate and verify the resilience of your digital identity.**

Security Twin is a local-first security dependency simulator. Its first web experience models a **fictional** account's smartphone, mailbox and recovery prerequisites. Visitors can switch failure scenarios, inspect the resulting graph and accessible route list, and compare a hypothetical independent security key — without an account or personal inputs.

> **Status (2026-10-17):** Phase 1 engine merged to main. The Phase 2a guest atlas and Next.js shell are implemented and verified on `main` (merged PR #2). The initial protected Vercel deployment is READY, though real iPhone Safari QA remains outstanding. Real user-specific graphs and encrypted persistence are not implemented.

## Run locally (Node 22 or 24)

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

The test suite covers 12 deterministic engine cases plus 6 guest demo scenarios. Last verified in Vercel's ephemeral cloud environment: **18/18 tests passed**, TypeScript check and production build passed. Chromium interaction/overflow checks passed at 320, 390, 768 and 1280 px. Real iPhone Safari/VoiceOver verification is still pending; see [Progress & handoff](docs/PROGRESS.md).

## Repository map

- `src/engine.ts` — pure typed three-valued access/recovery evaluator, candidate cloning and explanations.
- `src/demo.ts` — fictional guest account example, scenario changes and hypothetical spare-key comparison.
- `components/SecurityWorkspace.tsx` — interactive graph, accessible list, status detail, results and scenario controls.
- `app/` — Next.js 16 App Router shell and Security Twin-specific responsive UI styles.
- `tests/` — synthetic engine and guest fixture tests.

No login, cloud database, AI request, secret import, real provider integration or user graph persistence is present in this release candidate. **Never enter passwords or recovery codes here.** Browser storage alone is not a safe encryption boundary: real data storage must pass the recorded threat review first.

## Documentation

- [Master plan](docs/MASTER_PLAN.md) — mission, product differentiation, Phases 0–6 and release gates.
- [Domain model](docs/DOMAIN_MODEL.md) — graph semantics, actor distinction, known/unknown and scenario assumptions.
- [Phase 2 design](docs/PHASE2_DESIGN.md) — UX reference principles, copy and accessibility acceptance, data-storage prohibition.
- [Progress & handoff](docs/PROGRESS.md) — verified state, commits, tests, Vercel target and next action.

**Hosting:** [Security Twin on Vercel](https://security-twin-sphereorb.vercel.app) (deployment `dpl_NiNZRvu8v2KzCvYKPAwTU4UgS6Sh`, READY; Vercel Authentication protection enabled). Platform assigned the first manual Git-sourced deployment a **production** target; the repository is not connected for Git-triggered auto deployments, and automatic preview deployments are disabled. Real-device Safari/VoiceOver QA remains open. No GitHub Actions needed.

## License

[MIT](LICENSE) for software in this repository. Future public datasets and third-party contributions require their own license review.
