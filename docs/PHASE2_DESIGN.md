# Phase 2 — Guest atlas vertical slice

> **Status:** Guest atlas alpha implemented and tested · 2026-10-17 (JST)  
> **Implementation:** merged into `main` via PR #2, 2026-10-17 (squash commit `348d86f76dfde4569df9943b760095a11def5d77`); original branch `feat/phase-2-guest-atlas`  
> **Source of truth:** [MASTER_PLAN.md](./MASTER_PLAN.md), [DOMAIN_MODEL.md](./DOMAIN_MODEL.md), [PROGRESS.md](./PROGRESS.md)

## Scope for this branch

Deliver **one real interactive browser experience** showing how the loss of a primary phone changes an *illustrative* account's login and recovery paths. Use the Phase 1 deterministic evaluator; do not create an alternate scoring model. A visitor can switch among normal, lost-phone, lost-mailbox and compromised-mailbox scenarios; open graph nodes; inspect the explanatory list; add a hypothetical independent security key to a separate candidate; and compare the current model to that candidate. A permanent note must distinguish simulation from external configuration.

This is a **bounded Phase 2 alpha**, not the full promise of a customizable personal Security Twin. Authenticating account names, user email addresses, actual passkey stores or real credentials are not collected. Any real personal graph editor is a later step after a separate persistence/privacy decision.

## Privacy and storage decision — Phase 2a

Threats: account dependency relationships and recovery paths themselves reveal a person's sensitive security posture. `localStorage`, `sessionStorage`, IndexedDB and service-worker caches may expose such data to other code running on the origin, shared-device users or physical-device compromise. Browser storage by itself is **not encrypted storage**.

**Decision (2026-10-17):** The first guest demo uses a hard-coded fictional graph in memory. Only temporary React state for selected scenario, selected node and hypothetical candidate; no graph persistence (no cookies, local/session storage, IndexedDB, server requests, analytics, remote AI, export, screenshot upload or third-party embeds). This safely defers the key-derivation/encryption design, **not** an approval to persist personal graphs unencrypted. CSP and dependency restrictions still apply. The visitor can reload to reset state.

**Gate before real-user storage:** document attacker capabilities, encryption at rest and key derivation (audited Web Crypto/vetted KDF), unlocking and recovery UX, cross-device synchronization, ciphertext integrity and migration, mobile-browser eviction, export/delete and sensitive logging/analytics. Review before enabling editable real-world identities, imports or offline persistence.

## Design contract

Visual sources observed in existing repositories: sizuq's compact floating rounded header and dark/Lucid neutral surfaces; PluraThink's calm translucent tonal hierarchy; Luneidea's content-dependent status signals; CurveMora's progressive disclosure and quietly organized detail panels. **Do not import their entire design systems** or use generic site-building skills.

Security Twin's original visual language: a structured *security atlas*; dark graphite ground, restrained mint/cyan connector emphasis, amber uncertainty and muted coral interruption; small node/routing traces plus a readable descriptive list **from the same engine output**. Mobile should show the currently relevant issue rather than a sprawling dense node cloud. No numeric score, universal safe badge, alarmist copy or animated cybersecurity clichés.

Copy follows `akiralazycat/core/docs/copy/product-copy-guidelines-v1.md`: concrete and situation-first; clear distinction between `利用できる` / `利用できない` / `判断できない`; repeated concepts use stable labels. Prominent labels identify `架空の構成` and `仮の変更`. No inferred vendor guarantees or unearned "verified" status.

## Interaction and accessibility acceptance

- Registration-free opening on mobile, no sign-in CTA.
- Scenario buttons keyboard-operable with pressed state and a live result summary.
- Nodes implemented as buttons with accessible names; a text list displays the same status and rationale as the atlas.
- A spare key candidate does not alter the reference model; it is visually and verbally hypothetical.
- Phone loss blocks the baseline login; adding an independent spare key makes candidate login reachable *under explicit assumptions*.
- Unknown recovery step remains unknown; compromised mailbox does not automatically prove takeover.
- Responsive, 320px usable, visible focus states, reduced-motion support and no reliance on hue alone.
- No secrets, no personal data entry, no persistence or external account changes.
- Build/test verified; actual mobile viewport checks recorded explicitly (run or unrun).

## Implementation status and completed verification (2026-10-17)

- Implemented: `src/demo.ts`, `components/SecurityWorkspace.tsx`, `app/{layout,page,globals.css,icon.svg}`, Next.js configuration and a dependency lockfile. The sample model is isolated from real providers.
- Unit tests: **18/18 pass** (12 engine, 6 demo); cloud sandbox on Node 24.21.0, `npm ci --no-audit --no-fund` + `npm test`.
- Typecheck: `npm run typecheck` **passed**.
- Production build: `NEXT_TELEMETRY_DISABLED=1 npm run build` **passed**; prerendered `/` as static content, no backend.
- Chromium automated viewport checks: **320, 390, 768, 1280 px passed**. Exercised initial phone loss → hypothetical independent spare-key login, lost-mailbox recovery failure, compromised-mailbox takeover unknown, and network console requests. No unexpected external requests, JS page errors or horizontal document overflow detected in these runs.
- Real iPhone/Safari and screen-reader manual audit: **not yet performed**; do not claim cross-device certification. Scenario actions use `aria-pressed`, the proposal uses `role=switch`, active details use `aria-live`, and a text-based path list is always present.
- No GitHub Actions used or added. Chromium browser dependencies installed **only inside disposable Vercel sandbox**, never in deployed site dependencies.

## Implementation / release

Next.js App Router + React + TypeScript, CSS authored for this product. `src/engine.ts` remains the single calculation source. Vercel hosts this protected early preview (project `security-twin`, ID `prj_aFaxHaHyNd4d7TW3Mwiir7oPamtl`, preview auto-deployments disabled). The manual Git-sourced deployment `dpl_NiNZRvu8v2KzCvYKPAwTU4UgS6Sh` is **READY**, URL `https://security-twin-sphereorb.vercel.app`, source branch commit `4d55b0df73895a7d2a78b3a40acbd6bb6e76ac34`. Request intended staging, but Vercel actually marked it `production`; Vercel Authentication still protects Vercel-managed URLs. The repository is not linked for automatic deployments; do not introduce Neon/Supabase, login, AI, remote APIs or GitHub Actions. Git-linked Vercel project should prefer production-branch builds and avoid repeated preview builds, consistent with resource-conscious operations. Inspect current project configuration before deploying.

**Phase 2a exit**: functional demo, scenario/candidate tests, typecheck/build, automated Chromium viewports, and Vercel `READY` deployment met; **manual iOS VoiceOver/Safari QA and authenticated live HTTP smoke are outstanding**. No personal security data entry is authorized by this milestone. **Phase 2b** (not this branch): a privacy-reviewed personal model builder, resilient storage/export and broader verification workflow.
