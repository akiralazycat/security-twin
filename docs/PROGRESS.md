# Security Twin — Progress & Handoff

> **Updated:** 2026-10-17 (JST)  
> **Project status:** Planning baseline documented; implementation not started  
> **Authoritative intent:** [MASTER_PLAN.md](./MASTER_PLAN.md)  
> **Branch:** `main` (as of initial handoff)  
> **Next focus:** Phase 1 — typed domain model and deterministic scenario evaluation

## Snapshot: current reality (do not infer completion from the plan)

The repository was inspected on 2026-10-17. Before these documentation changes it contained only a short README and an MIT LICENSE. There was no application scaffold, runtime code, test suite, or deployed Security Twin observed in this repository.

**What is complete:** the conceptual master plan and handoff convention are documented.  
**What is NOT complete:** schema, rules engine, graph UI, privacy-reviewed local storage, consumer diagnosis, developer tools, public catalog, tests, live product.

No tests or builds were run for this documentation-only change. No remote services, accounts, or user credentials were accessed or modified.

## Roadmap state

| Phase | State | Work / acceptance reference |
| --- | --- | --- |
| 0 — Foundation | **Complete (docs only)** | Master plan, scope, product intent, phased acceptance, handoff |
| 1 — Model & engine | **Not started** | Typed graph; capability distinctions; evidence; deterministic scenarios; tests |
| 2 — Consumer vertical slice | **Not started** | Guest experience; mobile atlas + list; 1–2 failure simulations |
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

### Phase 1: model & deterministic engine — **NEXT**

- [ ] Write `docs/DOMAIN_MODEL.md` with entity/edge vocabulary and threat assumptions. Keep this as a precise design, not a second master plan.
- [ ] Define capability semantics for login, account recovery, authenticator re-enrollment, sensitive-account changes, and attacker takeover.
- [ ] Define AND / OR / threshold prerequisites and cycles; explain three-valued unknown behavior and assumptions.
- [ ] Decide in-memory baseline/candidate version semantics and source/evidence metadata.
- [ ] Prepare synthetic fixtures for: lost phone, lost mailbox, compromised mailbox, separate spare key, shared failure domain, unknown recovery, malicious recovery path, and graph cycle.
- [ ] Implement a **pure local library** computing outcomes and explanation paths from fixtures; choose repository structure only when actual code is needed.
- [ ] Run targeted local tests and record commands/results. No GitHub Actions required.
- [ ] Document limitations and cases where a provider-specific conclusion is not justified.

**Phase 1 exit gate:** reproducible tests pass; “unknown” is never treated as proven secure; hypothetical edits never mutate the baseline; results explain decisive prerequisites.

### Phase 2: smallest consumer experience

- [ ] Decide local encryption/persistence threat model **before** storing any personal graph.
- [ ] Implement registration-free scenario entry and guided, minimal model capture.
- [ ] Build graph + accessible list from one data model with progressively revealed complexity.
- [ ] Implement lost-phone case (plus mailbox loss if sufficiently supported) and current-vs-candidate views.
- [ ] Distinguish planned, configured, and proven controls in wording and visuals.
- [ ] Perform real mobile viewport and accessibility checks; do not assume graph-only UX works on phone.
- [ ] Verify there is no secret ingestion, no external account mutation, and no unsupported claims.

**Phase 2 exit gate:** one complete mobile-first experience that demonstrates a user-discoverable common failure domain and safe next step.

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

**One bounded Phase 1 task:** produce precise graph semantics and ~8 synthetic test scenarios, commit `docs/DOMAIN_MODEL.md`, update this file with the design decisions and commit SHA. Do not yet create a full web app or backend.

Then implement the smallest engine that passes those fixtures. Review the complete unit together before expanding it.

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
