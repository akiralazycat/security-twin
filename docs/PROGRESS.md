# Security Twin — Progress & Handoff

> **Updated:** 2026-10-17 (JST)  
> **Project status:** Phase 1 merged; Phase 2a fictional guest atlas cloud-verified and deployed behind Vercel Authentication (PR review pending)  
> **Authoritative intent:** [MASTER_PLAN.md](./MASTER_PLAN.md)  
> **Branch:** `feat/phase-2-guest-atlas` (unmerged); Phase 1 [PR #1](https://github.com/akiralazycat/security-twin/pull/1) merged  
> **Next focus:** Phase 2a PR review + Vercel deployment/real iPhone-Safari accessibility smoke; then review privacy gate for editable personal model

## Snapshot: current reality (2026-10-17 JST)

**Phase 1:** deterministic typed evaluator (owner vs attacker, login vs recovery, three-valued unknowns, immutable candidate), fully verified and integrated into main at commit `15f100ff98cbc6ade9ec851442d03f77aa8a2b77` (squash merge PR #1).

**Phase 2a (in feature branch):** registration-free, synthetic guest scenario explorer and comparison in a Next.js static-prerendered app. `src/demo.ts` holds an entirely fictional graph; `components/SecurityWorkspace.tsx` renders atlas, explanatory list, 4 scenarios, selected-node evidence and a hypothetical independent-key comparison. The site **does not request or persist personal security data**. Design and persistence boundary: [PHASE2_DESIGN.md](./PHASE2_DESIGN.md).

**Verified:** Node 24.21.0 in an ephemeral Vercel cloud sandbox; `npm ci`, `npm test` **18 passed / 0 failed**, `npm run typecheck` **passed**, `npm run build` **passed** (static /). Chromium automated interaction and overflow checks at **320, 390, 768 and 1280 px** passed; no page JS errors or unexpected external browser requests in these runs. Dependency lockfile committed. **No GitHub Actions.**

**Not done:** actual iOS Safari/VoiceOver manual audit, private-model editing, storage encryption/key lifecycle design, history/real verification workflow, developer studio and public catalog. Vercel project `security-twin` (`prj_aFaxHaHyNd4d7TW3Mwiir7oPamtl`) exists in team `team_sc8kOqVvtRrKPTwt2fSw6gWJ`; project is not Git-linked (manual deployment used). Preview deployments were disabled intentionally. **Protected Vercel deployment READY:** `dpl_NiNZRvu8v2KzCvYKPAwTU4UgS6Sh`, URL `https://security-twin-sphereorb.vercel.app`, from feature branch commit `4d55b0df73895a7d2a78b3a40acbd6bb6e76ac34`, Vercel target `production`, Vercel Auth enabled.

## Roadmap state

| Phase | State | Work / acceptance reference |
| --- | --- | --- |
| 0 — Foundation | **Complete (docs only)** | Master plan, scope, product intent, phased acceptance, handoff |
| 1 — Model & engine | **Complete / merged** | Typed graph; capability distinctions; evidence; deterministic scenarios; tests |
| 2 — Consumer vertical slice | **Phase 2a deployed (protected); manual iOS QA + personal model pending** | Guest experience; mobile atlas + list; 1–2 failure simulations |
| 3 — Explore & verify | **Not started** | Candidate comparison; hypothetical/actual/verified distinctions |
| 4 — Developer alpha | **Not started** | Expert workspace, policy, repeatable reports, local execution |
| 5 — Public Commons alpha | **Not started** | Curated sourced capabilities, correction protocol, public guides |
| 6 — Extensions | **Deferred** | AI editing, optional sync, CLI/MCP and continuous change intelligence |

## Detailed checklist

### Phase 0: documentation baseline

- [x] Locate and inspect `security-twin` repository and initial content.
- [x] Record product thesis and explicit non-goals.
- [x] Describe separate consumer, developer, public surfaces with shared analysis engine.
- [x] Prioritize interactive what-if, evidence states, candidate comparison, and verification.
- [x] Record staged delivery gates, privacy constraints and release acceptance.
- [x] Establish progress and handoff record.
- [x] Link navigation from root README.

### Phase 1: model & deterministic engine — **COMPLETE**

- [x] Write `docs/DOMAIN_MODEL.md` with entity/edge vocabulary and threat assumptions. Keep this as a precise design, not a second master plan.
- [x] Define capability semantics for login, account recovery, authenticator re-enrollment, sensitive-account changes, and attacker takeover.
- [x] Define AND / OR / threshold prerequisites and cycles; explain three-valued unknown behavior and assumptions.
- [x] Decide in-memory baseline/candidate version semantics and source/evidence metadata.
- [x] Prepare synthetic fixtures for: lost phone, lost mailbox, compromised mailbox, separate spare key, shared failure domain, unknown recovery, malicious recovery path, and graph cycle.
- [x] Implement a **pure local library** computing outcomes and explanation paths from fixtures; choose repository structure only when actual code is needed.
- [x] Run targeted local tests and record commands/results. No GitHub Actions required.
- [x] Document limitations and cases where a provider-specific conclusion is not justified.

**Phase 1 exit gate:** reproducible tests pass; “unknown” is never treated as proven secure; hypothetical edits never mutate the baseline; results explain decisive prerequisites.

### Phase 2: smallest consumer experience

- [x] Decide to prohibit real-user persistence in Phase 2a; record data/threat-model gate in `docs/PHASE2_DESIGN.md`. Detailed encrypted storage/key lifecycle choice remains **open** before personal editing.
- [x] Implement registration-free scenario switching over fictional example. **Real-user minimal model capture deferred** until the privacy gate.
- [x] Build atlas + accessible route list from the shared evaluator (synthetic example).
- [x] Implement lost-phone and mailbox scenarios, baseline and hypothetical key candidate.
- [x] Label hypothetical/illustrative evidence and refuse to present proposed controls as configured or proven (full verification workflow deferred).
- [x] Automated Chromium viewport/interaction checks at 320/390/768/1280px. [ ] **Actual iPhone Safari and VoiceOver manual audit outstanding.**
- [x] Verify fictional fixture, no form for secrets, no external account mutation and explicit unsupported-provider disclaimer.

**Phase 2a alpha gate:** fictional mobile-first experience verified in headless Chromium at emulated widths, deployed to protected Vercel. Real iPhone Safari/VoiceOver manual check remains pending. **Full Phase 2 gate is not met:** personal graph configuration, privacy-reviewed storage and genuine user context remain deferred.

### Phases 3–6

Follow the master's gate criteria. Do not preemptively scaffold all future modules. Add work items only when entering a phase.

## Scope / guardrails to carry to every implementation session

1. **Build differentiating interaction:** model → inspect → alter hypothetically → compare → perform manually → verify. A generic questionnaire or AI chat window is insufficient by itself.
2. **Privacy:** never solicit or store authentication secrets. Local-only is the default; encrypted persistence design must be deliberate.
3. **Honest evidence:** self-report, provider documentation, detected settings and tested results are different classes.
4. **Correctness:** normal login success does not prove emergency recovery; attacker and legitimate-user capabilities differ.
5. **Low overhead:** phone-first product; implementation can be driven via connected GitHub tools, not dependent on using a personal computer.
6. **No automatic GitHub Actions:** local/manual tests first, no obligatory CI or preview build. Do not create or trigger workflows without a separate decision.
7. **No uncontrolled scope expansion:** deliver Phase 1+2 before optional AI, cloud sync, or broad integrations.

## Immediate recommended next unit of work

1. Review the Phase 2a branch/PR, especially engine-to-UI semantics, selected node explanations, small-screen geometry and clear warnings. Follow the complete [Phase 2 design](./PHASE2_DESIGN.md).
2. **Deployment complete:** protected Vercel URL `https://security-twin-sphereorb.vercel.app` built READY from `4d55b0df…` with deployment ID `dpl_NiNZRvu8v2KzCvYKPAwTU4UgS6Sh`. It was requested as staging, but Vercel actually classified the deployment as `production`; default Vercel Authentication remains enabled. No unrelated domain was touched, and auto previews remain disabled.
3. **Next manual validation:** open the deployed page on a real iPhone (Safari) and check 320/390 style, orientation, VoiceOver names, dark contrast, reduced motion and candidate/real-setting distinction; document remaining defects and fix together before claiming Phase 2 complete.
4. **Do not expand into real accounts** until encrypted persistence / key recovery design has its own threat review. Afterwards decide whether to implement a simple local editor or a portable demo-first architecture.

## Handoff template (copy at the end of each completed task)

- **Date (JST):**
- **Work item / phase:**
- **Outcome:** planned / implemented / verified / blocked
- **Changed paths / commit / PR:**
- **Why / design decision:**
- **Tests actually performed and results:** (write “not run” when not run)
- **Known assumptions / remaining risk:**
- **Plan changes (if any):**
- **Next smallest action:**

Never imply an unexecuted test passed or an unmerged change shipped.

## Dated change log

### 2026-10-17 — Phase 2a guest atlas (implemented, cloud-tested and protected deployment READY)

- Phase 1 PR [#1](https://github.com/akiralazycat/security-twin/pull/1) reviewed/merged to main; merge commit `15f100ff98cbc6ade9ec851442d03f77aa8a2b77`.
- New branch `feat/phase-2-guest-atlas`. Added `docs/PHASE2_DESIGN.md`, `src/demo.ts`, `components/SecurityWorkspace.tsx`, Next.js `app/` files, CSS, security headers, example tests, `package-lock.json`, `.gitignore`.
- UI direction: `core` copy standard; sizuq floating glass chrome, PluraThink restraint, Luneidea state cues and CurveMora progressive disclosure, adapted to graphite/teal security atlas. No generic site-build skill.
- Data protection decision: fictional-only data; temporary React state; no real-account identities, passwords, passkeys or recovery codes, no persistence / analytics / server APIs. `docs/PHASE2_DESIGN.md` records why localStorage is NOT treated as encryption.
- Created Vercel project `security-twin` in the known team; preview deployments disabled. Manually deployed commit `4d55b0df…`: deployment `dpl_NiNZRvu8v2KzCvYKPAwTU4UgS6Sh` was **READY**, assigned `https://security-twin-sphereorb.vercel.app` and `https://security-twin.vercel.app`. Important: requested staging but Vercel returned target **production**. Vercel Auth is active for Vercel-managed URLs. Project is not linked to Git auto-deploy. No existing custom domain or customer data touched.
- **Cloud tests (verified):** ephemeral Vercel sandbox checked out the actual branch at `097e9ca`; Node 24.21.0, `npm install` then `npm ci --no-audit --no-fund`, `npm test` = **18/18 PASS**, `npm run typecheck` = **PASS**, `NEXT_TELEMETRY_DISABLED=1 npm run build` = **PASS** (statically prerendered route). Later changes to this branch were the tested dependency lockfile, Node engine-range adjustment, `.gitignore` and docs; no runtime logic changed after the browser run.
- **Chromium automation (verified):** width 320, 390, 768, 1280; test phone-loss login failure, independent-key hypothetical login success/delta, mailbox-loss recovery failure, compromised-mailbox unknown takeover, zero page errors/external requests, no horizontal document scroll.
- Headless Chromium required installing runtime shared libraries inside an **ephemeral sandbox only**, never a production runtime dependency. That sandbox subsequently stopped; no periodic compute scheduled.
- **Unverified:** actual iPhone Safari, VoiceOver/a11y expert audit and live app HTTP smoke through Vercel Authentication (READY confirms platform build/deployment only). No GitHub Actions used.
- Next: PR review / integration; real-phone Safari/VoiceOver smoke on the protected deployment; progress update.



### 2026-10-17 — Phase 1 validation passed (no CI)

- Verified exact source copies by Git blob SHA against the branch: `src/engine.ts` = `26fee8c850f514542c3929d17a325e795a1fcd60`, `tests/engine.test.mjs` = `313c9fa2d64a55007794be2d8727b278c0067682`, `package.json` = `d964174e362300230ec1e14519f205dbf6b7324c`, `tsconfig.json` = `67058e7f625054d16850a8d623b3abab773805fb`.
- Environment: Node v22.16.0, TypeScript 5.8.3. Executed `npm test`: **12 passed / 0 failed**; `npm run typecheck`: **passed** (exit 0). No external services, GitHub Actions, Vercel builds, provider accounts or secrets touched. No production deployment.
- Phase 1 acceptance semantics exercised by synthetic tests. Remaining: code review and PR integration, then Phase 2. These results do **not** verify browser/mobile UI or real provider security policies.



### 2026-10-17 — Phase 1 evaluator + synthetic offline tests (implemented)

- Branch: `feat/phase-1-domain-engine`; code: `src/engine.ts`; tests: `tests/engine.test.mjs`; commands: `npm test` and `npm run typecheck`.
- Core evaluator commit: `65b6dc31b2f076cfea9ff1e8010c6ff6c888afa7`; test file commit: `2df5444db83ddb202a0dc94a11185eb3da1be5c5` (package/scripts committed immediately before).
- Implemented typed owner/attacker capabilities, AND/OR/threshold prerequisites, fixed-point evaluation with unknown cycles, scenarios, trace output, candidate copies and diff. Tests cover lost phone/mailbox, compromise and additional checks, shared device, spare method, unknowns, cycles, thresholds, evidence, replay/validation and unrelated nodes (12 tests authored).
- **Initial verification obstacle:** repository source URL was inaccessible to the runtime; an attempted Vercel sandbox path was blocked. Subsequently, the source/test/package/tsconfig were reconstructed byte-for-byte in the runtime and all four Git blob hashes matched GitHub; actual offline tests/typecheck passed (see next entry). No GitHub Actions or sandbox created.
- **Deployment: not started.** No Vercel project named `security-twin` found in accessible listing; no production/preview release. Updated `README.md`. Draft PR [#1](https://github.com/akiralazycat/security-twin/pull/1) opened for Phase 1 review; verification is now complete and only review/integration remains.



### 2026-10-17 — Phase 1 domain semantics (design complete; engine pending)

- Branch: `feat/phase-1-domain-engine`; documented schema, three-valued semantics, owner/attacker distinction, scenario assumptions, cycles, candidates and ten synthetic fixtures in `docs/DOMAIN_MODEL.md`.
- Commit: `2a60d53a35a64f6d530768805c382a664fcdd6b6`.
- Consulted `core` copy guidance and existing sizuq/PluraThink/Luneidea UI implementations. UI direction and Vercel-hosting assumption are now recorded in `docs/DOMAIN_MODEL.md` without creating a generic UI scaffold.
- Tests/build/deploy: **not run** (design document only). Vercel project named `security-twin`: **not found** in accessible project listing. No production deployment or account changes.
- Next: implement the pure, bounded TypeScript evaluator and deterministic synthetic tests; then run tests and record real results.



### 2026-10-17 — Initial planning baseline

- Verified repository baseline: README + MIT license.
- Added `docs/MASTER_PLAN.md` with product thesis, UX, differentiators beyond AI chat, domain engine, privacy, developer and public layers, staged acceptance and non-goals.
- Master-plan commit: `06b0c1e4aeebbe237f35575c256de117b5bbbbcd`.
- Added this `docs/PROGRESS.md` for status and future cross-device/AI handoff.
- Updated README to point to the docs.
- Tests/build/deploy: **not run** (documentation-only); existing user accounts: **not changed**.
- Next: Phase 1 domain model + synthetic fixtures; defer implementation until the planned bounded scope is clear.

---

**Operating rule:** update this file after each meaningful implementation task, not only at milestones. Amend the master plan when intent changes; explain the reason here and keep Git history traceable.
