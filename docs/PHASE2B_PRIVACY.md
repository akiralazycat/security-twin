# Phase 2b — Session-only configuration and storage threat decision

> **Decision date:** 2026-10-17 (JST)  
> **State:** implemented, cloud-verified and deployed behind Vercel Authentication; PR #4 merged into main  
> **Parent plans:** [MASTER_PLAN.md](./MASTER_PLAN.md), [DOMAIN_MODEL.md](./DOMAIN_MODEL.md), [PHASE2_DESIGN.md](./PHASE2_DESIGN.md)  
> **Status log:** [PROGRESS.md](./PROGRESS.md)

## 1. Problem and bounded scope

Phase 2a demonstrates a single fictional setup. The next smallest improvement lets a visitor explore their **own abstract circumstances** without disclosing service names or secrets. The first editable dimensions are:
1. **A separate login route from the primary phone:** `yes` / `no` / `unknown`.
2. **A recovery route independent of the primary mailbox:** `yes` / `no` / `unknown`.

These represent the visitor's **unverified statements**, not checked provider settings. Avoid account names, email addresses, passwords, recovery codes, TOTP values, hardware IDs, locations, free-text notes or file uploads. Do not claim support for a specific service. The user can switch between `架空の例` and `自分の状況を試す` and reset session answers. Preserve graph/list and the same Phase 1 evaluator, including attacker/owner separation and `unknown`. No login, sync, telemetry or new backend.

**What is actually being analyzed:** conditional access given the two self-reported assumptions and the existing simplified phone/mailbox sample. A reported independent recovery route is only a *declared model path*; the product must repeatedly say its existence and independence have **not been verified**. Never suggest this proves successful recovery.

## 2. Threat model: data and attacker surfaces

| Asset | Threat | Phase 2b control |
| --- | --- | --- |
| Abstract answers (2 categorical values) | A shared device user or extension reads the open tab | React memory only; visible reset and refresh explanation; no account IDs |
| More detailed future dependency graphs | Browser XSS, injected third-party script, device backup or storage theft, origin compromise | **Not collected or persisted now**; storage gated on future design |
| Recovery notes and evidence | Leaks through analytics, app errors, URLs, server logs, AI requests, exports | No text input/telemetry/persistence/query-string encoding/export |
| Rule interpretations | Misleading confidence that reported option works on a real provider | Self-reported evidence and conditional wording; uncertainty explicitly retained |
| Lost/stolen device | Someone opens an already-unlocked page | Reset/close page, no saved graph; browser process memory is not guaranteed zeroizable |
| Supply chain / deploy admin | Malicious updated JS reads runtime state | Minimal dependencies, lockfile, source review, SSO protected test environment; no claim of cryptographic protection during an active compromise |
| Generated build and hosting | Debug symbols, error reporting and unexpected asset requests | No application API, no sensitive data in source or initial SSR; no third-party scripts or remote fonts |

Do **not** claim that memory-only state is invulnerable; browser extensions, same-origin script compromise, screenshots and endpoint/device compromise remain outside the initial protection boundary.

## 3. Persistence and encryption decision

**Decision D2b-01: NO PERSISTENCE for real or personally identifying graphs.** Even a non-secret dependency map may reveal security weaknesses; browser `localStorage` / IndexedDB / cookies do not provide a confidentiality boundary. Until a reviewed cryptographic protocol exists, all editable profile data is session memory only, reset on page refresh. No transmission, local browser DB, export, cloud record, PWA cache of user data or copied URL state. A user-facing statement must explain that the entered choices disappear on reload and are not an audited verification.

Before enabling persistence, separately approve:
- Threat scope: device seizure vs. malicious extension/XSS, shared user, cloud account, OS backup, browser sync, Vercel compromise, and user loss of decryption credentials; distinguish attackers we can and cannot defend against.
- Format: versioned, canonical serialized `GraphModel` with size/schema validation and independent metadata; authenticated encryption (e.g. Web Crypto AES-GCM) with fresh nonces and tamper rejection, binding schema/ruleset as authenticated associated data.
- Key lifecycle: device-only vs. passphrase-derived key, KDF threat/rate limits and UX; do not persist a usable decrypt key alongside ciphertext or assume OS passkeys provide a raw encryption key. Recovery/backup vs. confidentiality tradeoff must be explicit.
- Migration and deletion: safe version upgrades, export/import integrity, storage eviction/quota, voluntary local wipe and browser/device backup behavior; no silent remote copies.
- Accessibility and error paths: unlock failure, corrupted ciphertext, forgotten phrase, unsupported browsers, and authenticated exports; independent adversarial design review and browser tests before shipping.

No cryptography is implemented or represented as production-grade at this stage. In particular, **do not add a temporary plaintext save to simplify QA**.

## 4. Engine mapping contract

For two categorical selections, the adapter clones the sample graph:
- A declared alternative login asset is independent of phone. `yes` -> available (reachable only **under self-reported assumptions**), `unknown` -> unknown asset, `no` -> no declared alternative.
- A declared non-mailbox recovery method is independent of the mailbox. Same tri-state mapping; `yes` is reachable under a hypothetical recovery capability assumption and is never verified by the product.
- Default phone-based login remains an explicit assumption; unknown provider-specific extra identity checks remain unknown for mailbox recovery and attacker takeover.
- Under **lost-phone** with `no` other login, owner login is unreachable; with `unknown` other login, owner login is unknown; with `yes`, owner login is reachable only conditionally.
- Under **lost-mailbox** with `no` independent recovery, recovery unreachable; `unknown` -> unknown; `yes` -> conditionally reachable.
- Under **compromised-mailbox**, attacker takeover stays unknown when extra verification requirements are unknown, irrespective of self-reported *owner* alternate recovery.
- The hypothetical independent spare key is a separate *candidate* from the stated baseline, never silently changes the baseline or claims actual registration.

The on-screen list and graph must derive status from **one** `EvaluationReport`; actual source/evidence is `self-reported` (never `verified`). Product copy distinguishes `モデル上の結果` from `実際の復旧可否`.

## 5. Acceptance and handoff

- [x] Model adapter plus deterministic unit tests for 3 × 3 self-reported choices and phone/mailbox failure cases.
- [x] Mobile-first scenario controls in the existing Security Atlas; fictional demo remains usable unchanged.
- [x] Explicit reset and visible memory-only caveat. No identifiers or secrets solicited.
- [x] Accessible keyboard controls, label state, screen-reader status, narrow-width overflow check (automated Chromium and axe; manual VoiceOver still pending).
- [x] Cloud `npm ci && npm test && npm run typecheck && npm run build` passed (24/24 tests) and browser scenario checks passed; no GitHub Actions.
- [x] Record tested head, exact commands and deployment status (not yet deployed at this checkpoint) in [PROGRESS.md](./PROGRESS.md).

**Not in this branch:** account lists/identifiers, verified provider guidance, export, import, local encrypted database, biometric unlock, cloud sync, end-to-end encryption, AI diagnostics, auto-account changes, broad security score.

**Manual QA still open from Phase 2a:** real Safari/iPhone + VoiceOver; simulated Chromium viewports alone do not resolve it. Do not invent having performed a manual device session.

## 6. 2026-10-17 verification record

- Checked real repository branch head `4f6241666672d7283bb48faabf0b66b115b935c5` in a disposable Vercel sandbox; no GitHub Actions.
- `npm ci --no-audit --no-fund`: passed; `npm test`: **24/24 passed** (12 engine + 6 demo + 6 session-model tests). TypeScript `npm run typecheck`: passed. `NEXT_TELEMETRY_DISABLED=1 npm run build`: passed with static root route.
- Headless Chromium interaction at 320/375/390/768/1280px: **passed** all scenarios for unknown/no/yes login, yes/unknown recovery, attacker unknown, hypothetical key comparison, reset, reload, zero console errors/unexpected external requests and no horizontal document overflow.
- Accessibility using `axe-core` WCAG 2 A/AA + 2.1 A/AA tags at 320/390/1280px in both sample and session modes. Initial check found a single contrast issue on muted text; fixed by increasing `--subtle` luminance to `#98aba9`; **zero automated violations across six reruns** (24 passing rules, two manual-review/incomplete findings per run). This is **not** a manual screen-reader or actual Safari/iPhone certification.
- No analytics, external API integrations, real account inputs, personal identifier persistence or cryptographic vault. React state only. Original checkpoint was pre-release. It is now integrated through PR #4 and deployed with PR #5's Next.js update at Vercel deployment `dpl_HtfTZjyPNQ2dtWXznZ1Azuh5Fuuu` (READY, protected). Actual iPhone Safari/VoiceOver and authenticated live HTTP checks remain incomplete.
