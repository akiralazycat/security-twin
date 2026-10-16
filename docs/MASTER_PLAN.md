# Security Twin — Master Plan

> **Status:** Planning baseline v1.0 (not an implemented product)  
> **Established:** 2026-10-17 (JST)  
> **Last reviewed:** 2026-10-17 (JST)  
> **Source of truth:** This plan for product intent; [PROGRESS.md](./PROGRESS.md) for implementation status, decisions, and handoff.  
> **Repository:** `akiralazycat/security-twin`

## 0. Executive summary

**Security Twin is a local-first, evidence-aware workspace for understanding, exploring, improving, and verifying the resilience of a person's digital identity environment.** It models accounts, devices, authenticators, password managers, identity providers, recovery channels, and the dependencies between them.

**Core promise:** _Understand what happens if an account, device, provider, or recovery path fails — explore better configurations before making changes — and verify what has actually been done._

The product is not another password manager or breach-notification service. It complements existing products and must not create a new central store of passwords or passkey private keys.

Three product surfaces share one typed model and deterministic analysis engine:

1. **For Everyone:** accessible mobile-first guidance and an interactive personal Security Twin.
2. **For Developers:** a security architecture workspace, structured policy/scenario analysis, and local tools.
3. **For Society:** open educational resources, service-capability data with provenance, and open interoperability specifications.

The **differentiator from a generic AI assistant** is not a better chat response, a one-off diagram, or a score. It is a persistent, editable, versioned, inspectable, testable representation of the user's actual environment; live what-if exploration; constraint-driven comparison of alternatives; and evidence-linked real-world verification. AI is an optional interface to this system, not its source of truth.

## 1. Problem, users, and jobs

### 1.1 Problem

- A service provider can leak personal data even when the user uses passkeys.
- A secure primary login may coexist with a weaker recovery or account-change path.
- Redundant-looking credentials may share one failure domain (e.g., same device, mailbox, provider, location).
- Users rarely test whether an offline backup or independent recovery path works.
- Existing advice is fragmented by provider; the impact on **this user's particular configuration** is hard to understand.
- Developers can build robust login but overlook recovery flows, sensitive changes, lifecycle controls, or lockout risks.

The goal is to reduce **account takeover propagation, exposure blast radius, and irrecoverable lockout** through informed configuration and proof. This product **cannot stop third-party breaches at their source** and must not promise zero risk.

### 1.2 Users and jobs

| Persona | Primary job | First meaningful result |
| --- | --- | --- |
| Non-expert individual | “If I lose my phone, can I get back in?” | Understand one key dependency and one actionable improvement |
| Privacy/security-conscious individual | Reduce single points of failure without excessive complexity | Compare current vs. alternate structures and verify independence |
| Person handling a suspected breach | Find safe first actions and scope of impact | Clear emergency triage, prioritized official guidance |
| Developer / product owner | Find flaws in authentication/recovery architecture | Reproducible scenario results and a review checklist |
| Educator / nonprofit | Teach safe digital identity habits without real credentials | Free offline-capable educational scenario |

### 1.3 Product principles

1. **Model, then explain:** typed dependencies and rules outrank free-form AI assertions.
2. **Attack resistance AND recovery continuity:** optimize both; improving one may harm the other.
3. **Unknown is not safe:** explicitly distinguish observed, self-reported, inferred, stale, and unknown claims.
4. **Simulation ≠ configuration:** planning changes never imply external account settings changed.
5. **Least data:** never ask for passwords, recovery codes, private keys, OTP seeds, or other authenticating secrets.
6. **Local-first, optional cloud:** guest use must be meaningful; sensitive model stays local by default.
7. **User agency:** no automated disabling of MFA, account recovery, or other sensitive settings.
8. **Accessibility before jargon:** situation-first language, details on demand.
9. **Open public core:** free safety guidance and portable formats without lock-in.
10. **Scope discipline:** demonstrate the core value with one small, correct vertical slice before platform expansion.

## 2. Product boundaries and competitive positioning

### 2.1 What Security Twin is

A _security architecture simulator for personal identity_, with progressively richer developer tooling and public reference data.

### 2.2 What Security Twin is not

- Not a password or passkey vault, credential autofill system, authenticator, password cracking/recovery utility, or a replacement for the OS keychain.
- Not an automatic scanner with universal access to Apple/Google credential stores. Provider APIs and permissions must be checked individually; otherwise rely on explicit user inputs and official documentation.
- Not an identity theft prevention guarantee, insurance product, paid “protection” badge, or certification authority.
- Not a penetration testing/exploitation toolkit or a place to publicly expose sensitive recovery attack recipes for specific organizations.
- Not an always-on agent collecting every user's account data.
- Not a mandatory cloud-synced account system.

### 2.3 AI-vs-product moat

A chat assistant can generate advice, tables and one-off graphics. Security Twin must provide **five inseparable advantages**:

1. **Live security atlas:** expandable graph/list views over the same current model.
2. **Direct-manipulation playground:** remove a device, switch a recovery factor, inspect cascading effects instantly.
3. **Variant explorer:** branch from a baseline; compare multiple realistic configurations and constraints without losing the original.
4. **Evidence ledger:** every important edge/claim has source, date, verification status and uncertainty.
5. **Execution loop:** propose → simulate → approve plan → user changes real settings → verify safely → record a versioned diff.

If a feature can be recreated adequately as a static AI answer, it should not dominate MVP scope.

## 3. User-facing experiences and information architecture

### 3.1 Guest entry (mobile-first)

Initial screen: **Check my safety / What if I lose my phone? / Possible data leak / Prepare for recovery**. No sign-up prerequisite. “I don't know” is a valid response.

First session uses a tiny questionnaire (device ecosystem, main credential manager, whether alternative access exists) only for **routing**, not a conclusive security score. Immediately show one relevant dependency and one safe next step. Progressively request only data required to analyze the selected scenario.

### 3.2 Core workspace

Views of one model, not competing sources of truth:

- **Overview:** account groups, important common dependencies, unknowns, current next action.
- **Atlas:** collapsible graph of accounts, authenticators, providers, devices and recovery paths. Tapping a node shows dependents, prerequisites, available evidence, and failure domain.
- **Playground:** toggle failure scenarios; fork proposed changes; show the impact in graph + list + explanation at the same time.
- **Explore:** compare baseline, template, and candidate designs. Show convenience, cost, independence, recoverability, uncertainty and required steps (not one opaque security score).
- **Verify:** track “planned / performed / verified / needs recheck” and the specific claim tested.
- **History:** baseline versions and changes with evidence dates, not a false claim of continuous automatic monitoring.

Mobile interaction: progressive disclosure and focus mode rather than rendering hundreds of tiny graph nodes. A plain accessible list/table must always be available alongside graphic views. Keyboard and screen-reader behavior are required in acceptance tests.

### 3.3 Mandatory initial scenarios

1. **Lost primary phone**: direct/indirect dependencies on that device.
2. **Loss of primary mailbox or identity provider**: distinct from a leak or takeover.
3. **Compromised email account**: accounts reachable through recovery/change paths, where known.
4. **Authenticator loss**: effects of removing a key, backup, or second device.

Model **access to an account**, **account recovery**, **re-enrollment of an authenticator**, **change of sensitive settings**, and **attacker takeover** as different capabilities. A successful normal login is not proof of an independent recovery path.

### 3.4 Sample interaction (not an assertion about actual providers)

A fictional Service X allows a device-bound credential OR a separate security key OR a recovery path requiring access to Mailbox Y plus additional identity checks. Mark the phone lost, inspect consequences, propose an independent key, compare the before/after result, then follow official steps to configure it. The graph must never treat “proposed” as “registered,” or “registered” as “recovery verified.”

## 4. Shared domain model and inference design

### 4.1 Core entities (initial candidate schema)

- **Account / Service**: identifier or user-given alias, importance, provider metadata.
- **Device / Location / FailureDomain**: distinct physical or organizational dependencies; avoid storing exact personal addresses.
- **Authenticator / CredentialReference**: _type and registration location only_; never secret material.
- **IdentityProvider / Mailbox / RecoveryChannel**: separate provider/service and access capability.
- **Capability**: login, recover account, reset authenticator, change sensitive settings, attacker access.
- **PrerequisiteGroup**: AND / OR / threshold relationships; exact semantics documented.
- **Scenario**: lost, unavailable, compromised, or intentionally removed assets.
- **Evidence**: assertion, subject, source category, observed_at, checked_at, status, scope and notes.
- **ConfigurationVersion / ProposedChange / VerificationTask**: current, hypothetical, executed and tested states.
- **ServiceCapability**: versioned public facts with official source links, conditions and verification dates.

Keep identity aliases separable from public service metadata, and store nothing that itself enables account recovery.

### 4.2 Engine semantics

- Deterministic graph evaluation under explicit assumptions.
- **Three-valued status** at minimum: reachable / unreachable / unknown; do not coerce unknown to false or safe.
- Distinguish confidentiality/attacker path analysis from legitimate-user availability/recovery analysis.
- AND/OR dependencies, minimum cut sets / shared failure domains for bounded small graphs; explicit limits to avoid combinatorial blowups.
- What-if is a **pure evaluation of a cloned candidate configuration**, with no external mutation.
- The ruleset and evidence version travel with each result to make replays possible.
- Store counterexamples and explanation paths: _which prerequisites failed_ and _why a result is uncertain_.
- Avoid invented percentages and universal numeric security grades; use clear conditional conclusions.
- An engine result is not an independently verified claim about an external service's implementation.

### 4.3 Core tests required

Small, synthetic graph fixtures cover: independent two-path recovery; misleading redundancy sharing one provider; cycles; a lost device; email-compromise path; recovery-with-extra-check not sufficient for takeover; a missing/unknown prerequisite; a proposed change not affecting baseline; deterministic replay after export/import; and candidate comparison without data leakage.

Use property-based tests where useful for basic invariants (e.g., disconnected unrelated nodes cannot alter a result; hypothetical edits do not change the baseline). Security-critical logic needs code review and documented threat assumptions.

## 5. Configuration Explorer / templates

Offer an illustrative **simple**, **balanced**, and **high-assurance** archetype, each with suitability caveats, not a universal best architecture. Each comparison must surface:

- Ownership and usability constraints: device ecosystem, budget, desired friction, offline needs.
- Shared dependencies, key custody/storage separation, service support, and expected loss scenarios.
- Tradeoffs between attacker resistance and legitimate recoverability.
- Unsupported or unverified assumptions; clearly state when constraints cannot be proven satisfied.
- Ordered human-executable steps, links to official documentation, and verification tasks.

Longer term: cost-constrained candidate generation and minimal-change optimization with testable constraints; do not implement a broad optimizer before the core engine is trustworthy.

## 6. Developer Studio (same engine, separate surface)

Separate expert workspace instead of cluttering consumer UI:

- Visual architecture mapper and import/export of a versioned schema.
- Declarative security objectives and reusable threat scenarios.
- Authentication/recovery lifecycle modeling; design-time, integration-test, and operation-time evidence distinguished.
- Deterministic test output and architecture diffs; NIST SP 800-63 and OWASP ASVS mapping **as references with versioned criteria, not as automatic compliance certification**.
- Optional CLI/library/API; later optional MCP interface initially read-only.
- No GitHub Actions dependency. Local tests and manual runs are first-class; any CI integration is explicitly opt-in.
- Do not ingest actual API keys, account passwords, secret env vars or production session credentials.

A possible later `security-policy.yaml` format may declare goals like “tolerate one lost device.” The system must state whether available evidence is sufficient to verify each goal.

## 7. Public interest: Open Security Commons

Public-service strategy, staged rather than requiring a foundation at launch:

1. **Forever-free baseline:** incident first steps, passkey/2FA/recovery guidance, guest baseline diagnosis and learning scenarios.
2. **Public Service Capability Catalog:** versioned provider capabilities and official references (passkeys, physical keys, fallback factors, recovery flows, removal and change controls). Preserve “supported / conditional / deprecated / unverified” and source dates.
3. **Open schema / portable export:** model, scenario, and evidence spec; transparent test fixtures to resist vendor lock-in.
4. **Education:** synthetic examples that require no personal or credential data; accessible translations and reusable teaching materials.
5. **Contributor governance:** corrections, official sources, moderation, dispute process and a separation between verified facts and user submissions.
6. **Responsible disclosure:** avoid publishing actionable private weaknesses; support vendor contact and established disclosure procedures.
7. **Long-term sustainability:** consider nonprofit stewardship of public standards/data separately from paid hosting/services; no legal entity decision is implied now.

Existing directories/guides must be evaluated before duplicating them; public catalog value comes from **conditions + evidence + user-specific compatibility + change impact**, not a bare “supports passkeys” list.

Public data licenses and contributor terms must be chosen before accepting submissions; the repository currently contains an MIT LICENSE for code, which should not be silently assumed to settle every future dataset's rights.

## 8. Privacy, security, and safety architecture

### 8.1 Trust boundaries

- **No authentication secrets collected:** no passwords, private keys, passkey secrets, recovery codes, TOTP seeds, session tokens, or hardware key secrets.
- **Guest first:** no server account needed for first meaningful use.
- **Local-first:** graph, aliases, risk relationships, scenario history, and verification evidence remain on device by default.
- **Explicitly opt-in remote AI:** send only a redacted minimal snapshot on affirmative user action; present what is shared and warn that sensitive relationship metadata is still personal information.
- **No external account edits in MVP.** Official provider settings are opened for the user to perform changes.
- **Provider access by documented permission only.** No scraping private credential stores, silent account enumeration or pretending a third-party API exists.

### 8.2 Data protection design gates

- Choose threat model and local encrypted storage scheme before persisting any real user account graph. Browser “local-first” alone is **not** an encryption guarantee.
- Investigate Web Crypto / vetted KDF and key lifecycle, passphrase loss, device-level storage, offline availability, backup/restore integrity, and mobile-browser constraints; record the decision.
- Support deletions and portable exports; never log graph contents, recovery metadata or sensitive identifiers in analytics/error reports.
- Treat imported models, public catalogs, documents and AI responses as untrusted input. Validate schemas, escape rendering, enforce bounded graph size and prevent prompt-injection-driven side effects.
- CSP, dependency hygiene, versioned migrations, accessibility and rate limiting (where networked) as appropriate.
- Do not manufacture “verified security” badges from self-assessment, static design, or a passkey registration screenshot.
- Incident-response instructions must prioritize official recovery/containment steps and warn against entering secrets into the product.

### 8.3 Risk-register starter

| Risk | Mitigation |
| --- | --- |
| False reassurance caused by uncertain provider semantics | Unknown state + linked evidence + scenario assumptions shown |
| Overcollection of highly revealing dependency graph | Data minimization, local-first, optional export/sync only |
| Lockout caused by removing recovery methods | No automated mutations; prerequisite checklist and safe verification |
| Confusing login, recovery, key reset, and takeover | Separate typed capabilities and tests |
| Model graph too complex on mobile | Progressive disclosure and accessible list fallback |
| Public catalog stale or misleading | Official links, dates, conditional support, review workflow |
| AI hallucinations interpreted as proof | AI suggestions cannot modify verified facts without review |
| Excessive MVP scope | Release gates, non-goals and phased rollout |

## 9. Proposed technology and delivery approach

**Implementation choices are provisional until Phase 0 decisions.**

- Mobile-first web/PWA initially; Next.js + TypeScript is a reasonable option, but the repository currently contains no application scaffold.
- Separate package boundaries: `domain/schema`, `core/engine`, `app/consumer`, `app/developer`, `commons/catalog` where justified; don't create empty packages prematurely.
- Pure deterministic TypeScript model/engine; graph rendering is an adapter, never the source of truth.
- Schema versioning, reproducible fixtures, import/export. No server/database dependency for simulation.
- Offline-capable distribution and data migration testing. Opt-in E2EE synchronization may be considered only after explicit threat review; cloud database vendor is not decided.
- AI may be added as an optional adapter after core determinism, with strict read/plan permissions initially.
- No mandatory GitHub Actions or preview deployments; local tests/manual validation first. Deploy only meaningful main changes when application deployment begins.

## 10. Milestones and acceptance gates

Do not add unrelated features to clear a milestone. Plans may change only with rationale and dated history.

| Phase | Deliverable | Exit criterion |
| --- | --- | --- |
| **0 — Foundation** | This master plan, status/handoff, problem definition, scope, risk assumptions | Documents committed; no implementation claims |
| **1 — Model & engine** | Typed graph, explicit capability semantics, evidence states, fixtures, deterministic what-if | Unit tests for loss/compromise/cycles/unknown; baseline immutable |
| **2 — First consumer vertical slice** | Guest flow, one simple account graph, iPhone-loss or mailbox-loss simulation, list+graph, one recommended next step | Mobile usable without registration, one coherent end-to-end scenario, accessible fallback, no secrets collected |
| **3 — Explore & verify** | Fork/compare candidates, basic templates, actions with planned/performed/verified separation, export/import | Simulated vs real changes cannot be confused; evidence survives export; three candidate types explained |
| **4 — Developer alpha** | Separate expert view; local config import; scenario test report; reference rules | Same fixtures yield same results in consumer and dev surfaces, no CI requirement |
| **5 — Public Commons alpha** | Curated small provider catalog, citations/date/status, correction workflow, public guides | Every catalog claim has a source and freshness metadata; no sensitive weakness dump |
| **6 — Optional extensions** | AI-assisted editing, privacy-reviewed optional sync, CLI/MCP, change tracking | Driven by measured user value and independent risk reviews |

**First product milestone is Phase 2**, not a comprehensive identity platform. Phases 4–6 do not block delivery of the basic consumer experience.

### 10.1 MVP acceptance scenarios

- Guest user can define a fictional primary phone, mailbox and one important account without revealing credentials.
- Toggle lost-phone; see affected capabilities **and an explanation** in graph/list/accessible text.
- Add a **hypothetical** independent authenticator to a candidate; see before/after without changing baseline.
- Unknown recovery prerequisites produce “undetermined,” not a green/safe result.
- A recommendation has an actionable, official-guidance-oriented next step and a verification status.
- Export/import a minimal non-secret model or explicitly document that it is deferred; sensitive persistence is blocked until storage threat review.
- Tests do not depend on cloud or GitHub Actions; no external account is modified.

## 11. Measurement and validation

**Primary success signal:** meaningful previously unnoticed dependency discovered and a validated improvement completed (measured with privacy-preserving, opt-in feedback rather than invasive account tracking).

Secondary hypotheses to test:
- Can a novice identify a shared failure domain within a few minutes?
- Does visual what-if exploration change understanding compared with a text-only guide?
- Can users distinguish hypothetical, performed, and verified states?
- Can developer scenarios reproduce independently across sessions?
- Can public source data be maintained accurately enough to be worth consuming?

Avoid vanity metrics such as diagnostic counts or opaque “security score increased.”

## 12. Monetization and public-interest safeguards

- Core safety guidance, emergency response guidance, guest baseline exploration and educational examples should remain free.
- Potential paid services: multi-profile/household management, advanced organization views, scheduled evidence rechecks, hosted collaboration, commercial API throughput.
- Never paywall emergency steps, fabricate alarm to drive purchases, sell raw security graphs, or require a paid subscription to export a user's own data.
- Public/private asset governance and pricing remain **unvalidated hypotheses**, not commitments.

## 13. Decisions, open questions, and explicit non-goals

### Decisions at plan baseline (2026-10-17)

- Build a **simulation workspace**, not a password manager or AI chatbot clone.
- Three surfaces share a typed engine; prioritize an uncomplicated consumer experience.
- Attack paths and legitimate recovery paths are analytically distinct.
- No secret collection, no automatic changes to external accounts, and no unsupported provider integrations.
- Guest-first, mobile-first, local-first are product requirements.
- AI, synchronization, comprehensive catalog, and advanced developer tools come **after** a correct minimal engine.
- No mandatory GitHub Actions; do not spend CI minutes merely to verify document changes.

### Open questions requiring a recorded decision before corresponding implementation

- Precise threat model and encryption/key recovery design for local persistence.
- Smallest complete AND/OR/threshold schema and treatment of account-change proofs.
- Which scenario and visual renderer make the Phase 2 experience clearest on small screens.
- Whether (and when) to introduce a backend, cloud AI, or multi-device E2EE.
- Public catalog editorial, license and third-party terms.
- Brand, domains, pricing, formal organization and any assurance/certification claims.

### Deferred intentionally

Universal account import, browser extension, vendor-specific account automation, credential custody, scanning arbitrary private sites, continuous device surveillance, insurance/certification, complex ZKP credentials, sweeping compliance auditing, and broad provider integrations.

## 14. Documentation and change-management contract

- **Master plan:** `docs/MASTER_PLAN.md` — durable intent, scope, architecture, acceptance gates. Update when decisions change; retain meaningful rationale in Git history.
- **Progress/handoff:** `docs/PROGRESS.md` — factual current state, completed work, blockers, next actions, dated change log and links to commits/PRs. Update **when each implementation task is completed**.
- **README:** minimal entry point linking both documents.
- Prefer small, complete milestones and a single planned review/integration gate over scattered repeated validation.
- Distinguish **planned / in progress / implemented / verified / shipped**. Never label planning as implemented.
- Record date (JST), decision, reason, changed paths, tests actually run, and next action; preserve enough context to resume from phone/PC or another AI.
- Keep detailed implementation changes traceable by Git, and rewrite stale intent when necessary with a dated change entry rather than leaving contradictory active plans.

---

## Appendix — Outside references to evaluate during implementation

These are contextual reference families, not a claim that standards automatically certify the product: FIDO Alliance passkey UX/security guidance, NIST SP 800-63 series, OWASP ASVS, W3C WebAuthn, provider-specific published passkey/recovery docs, existing public passkey directories and disclosure guidance (e.g., security.txt / RFC 9116). Cite exact versions and URLs when implementing rules.

**Next action:** agree on the Phase 1 graph semantics and synthetic fixtures, then create the smallest deterministic engine before UI scaffolding.
