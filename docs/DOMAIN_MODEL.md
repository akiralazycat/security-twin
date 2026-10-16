# Security Twin — Domain model & engine contract

Status: Phase 1 design baseline · 2026-10-17 (JST)  
Master: [MASTER_PLAN.md](./MASTER_PLAN.md) · Handoff: [PROGRESS.md](./PROGRESS.md)

## 1. Boundary and threat assumptions

The engine evaluates **declared, fictional or user-supplied dependency assertions**. It never discovers real account configuration or treats service behavior as verified. The first model is in memory only; no persistent storage, credential imports, hosted database, remote AI, analytics or external settings changes.

A **lost/unavailable** item is inaccessible to the legitimate owner in the chosen scenario, but is *not automatically controlled by an attacker*. A **compromised** item is attacker-controlled in the hypothetical scenario; it remains accessible to its legitimate owner for this model unless also marked unavailable in a separate scenario. This is a simplifying, explicit assumption, not a statement about sessions or real compromise. Unknown means neither safe nor definitively inaccessible.

Analyze separate actors: **owner** (continued access and recovery) and **attacker** (possible takeover). Analyze separate capabilities: **login**, **recover**, **reenroll**, **change-settings**, **takeover**. An account's owner-login status does not prove recoverability; attacker access to an email does not automatically prove takeover. The model expresses takeover only through explicit attacker-directed prerequisites.

Only record references to methods (e.g., “spare security key”), not passwords, PINs, passkey material, recovery codes, TOTP seeds, or account identifiers required to authenticate.

## 2. Schema v1

- **Asset**: opaque ID, label, kind (device, mailbox, authenticator, provider, check, other), and optional evidence reference. Default availability in the baseline: `available` or `unknown`. An available baseline asset is *assumed usable by owner*, not independently verified.
- **Capability**: opaque ID, account alias, kind, actor, alternative prerequisite groups, evidence reference. Each group holds IDs of required assets or capabilities and `minimum`; `minimum=length` means AND, `minimum=1` means OR within a group, intermediate values mean threshold. Alternative groups are OR; an empty list of alternatives is **unknown**, never an unconditional grant.
- **Evidence**: ID, source category (`illustrative`, `self-reported`, `official-documentation`, `tested`), status (`unverified`, `reported`, `verified`, `stale`), optional source URL/date and notes. The engine retains metadata in the model; it **does not promote a modeled capability to verified** merely because it is reachable.
- **Scenario**: ID and a map of asset IDs to `lost`, `unavailable`, `compromised`, or `unknown` (baseline when absent). Each scenario is applied to a copy; it never edits the baseline.
- **Version**: schema identifier `security-twin/v1`, ruleset identifier `phase1-1`, and a caller-supplied configuration ID to support replay. Stable ordered output makes comparisons reproducible.

## 3. Three-valued evaluation

Statuses are `reachable`, `unreachable`, `unknown`. For a threshold group, reachable if at least `minimum` inputs are reachable; unreachable if reachable + unknown is below `minimum`; otherwise unknown. The capability is reachable if **any** alternative group is reachable; unreachable if **all declared** groups are unreachable; otherwise unknown. No declared groups → unknown.

Owner sees `available` / `compromised` baseline assets as usable, and lost/unavailable as unreachable. Attacker sees `compromised` as reachable, normal available/lost/unavailable as unreachable; unknown remains unknown. This attacker model evaluates **explicit compromise-path assumptions only**, not all conceivable phishing, theft or zero-day routes.

Capability dependencies may refer to other capabilities of the **same actor only**. Values are iterated synchronously from unknown to a fixed point so order of declarations does not affect outcomes. An unsupported cycle remains **unknown** instead of being called a successful route. An alternate independent known path can resolve a cycle. Model validation rejects duplicate IDs, missing references, invalid threshold bounds, actor-crossing capability references and oversized graphs. No negative logical prerequisites in v1.

Results include each capability status, each declared alternative's status, and the input status/explanation for each prerequisite. These are explanation **traces**, not certified proofs of provider behavior. Scenario and configuration version are included in evaluation output.

## 4. Synthetic fixtures / coverage contract

| Fixture | Question | Expected result |
| --- | --- | --- |
| Lost phone | Does a device-only login survive phone loss? | Owner login unreachable |
| Lost mailbox | Does mail-only recovery survive mailbox loss? | Owner recover unreachable |
| Compromised mailbox | Does an email-only reset allow takeover? | Attacker takeover reachable **only when explicitly modeled** |
| Extra check | Does mailbox compromise alone bypass another required check? | Attacker takeover unreachable |
| Independent spare | Does adding an independent spare method to a **candidate** help? | Candidate login reachable; unchanged baseline unreachable |
| Shared failure domain | Are two methods on one lost device truly independent? | Both unavailable; login unreachable |
| Unknown recovery | Does an unknown provider-specific step count as safety? | Owner recover unknown |
| Cycle | Can two capabilities mutually justify access? | Unknown absent an independent anchor |
| Threshold | Are 2-of-3 prerequisites correctly evaluated? | Reachable, unknown and unreachable cases |
| Replay | Do repeated evaluations and copied candidates agree? | Stable deterministic outputs, no baseline mutation |

All fixture names and entities are explicitly fictional. Do not infer real Apple, Google, bank or other vendor policy from these tests.

## 5. UI and delivery decisions recorded for Phase 2

**Reference code consulted (2026-10-17):**
- `core/docs/copy/product-copy-guidelines-v1.md`: concrete behavior first, stable vocabulary, evidence/claim calibration, explicit security warnings.
- `sizuq/src/components/layout/FloatingHeaderFrame.tsx`: floating rounded mobile-safe header geometry, not a direct copy of product branding.
- `plurathink/app/globals.css`: restrained surfaces and low-contrast borders; the Security Twin design should not inherit a generic chat-landing visual.
- `luneidea/app/globals.css`: contextual functional cues / scenario-specific styling, not game-like score mechanics.
- CurveMora: progressive disclosure, quiet data presentation and visually grouped tasks rather than copying its learning metaphors.

**Security Twin art direction:** an accessible, restrained *security atlas* — graphite/ink neutrals, small controlled cyan or teal indications for a simulated route, amber for uncertainty, red for a demonstrated loss path. No default “green = safe” badge; no imaginary numeric risk grade. Graph and explanatory list derive from the same result. Mobile focus mode first, generous touch targets, reduced-motion support, dark/light contrast checks. Use deliberate structured UI rather than a generic SaaS dashboard template or standard site-build skill.

**Host:** Vercel, with static/Next.js web distribution in a later phase. The Phase 1 engine has no Vercel runtime dependency. No Vercel project was found for `security-twin` when inspected 2026-10-17; do not claim deployment. No GitHub Actions required. The Phase 2 persistence/privacy design gate remains open: do not store personal security graphs on device until an explicit encryption, key lifecycle and export threat review is recorded.

## 6. Out of scope / review

No universal provider capability truth, secrets, AI claims, backend, CI, auto-configuration, graph renderer, hosted login, or data persistence. Phase 1 is complete only after actual offline unit tests and review of error cases. Update [PROGRESS.md](./PROGRESS.md) after each completed implementation task.
