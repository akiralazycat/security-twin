# Security Twin

**Explore, simulate and verify the resilience of your digital identity.**

Security Twin is a mobile-first, local-first workspace in development for mapping account, device, passkey, password-manager and recovery dependencies. It helps individuals understand how a loss or compromise propagates, compare hypothetical security configurations, and verify actual improvements. A shared analysis engine is intended to support a future developer workspace and open public security commons.

**Status (2026-10-17): Phase 1 pure engine implemented on a feature branch; tests not yet executed.** The repository does not yet contain a web application or a Vercel deployment.

## Phase 1 engine (branch: `feat/phase-1-domain-engine`)

- `src/engine.ts` — schema, validation, fictional scenario evaluation, candidate creation and comparison. No network, storage, user credentials or vendor integrations.
- `tests/engine.test.mjs` — synthetic scenarios, intended to run using Node.js 22's TypeScript type stripping.
- `npm test` — run the offline tests (not yet executed during this session).
- `npm run typecheck` — use TypeScript 5.8+ (install or provide `tsc` in the runner); not yet executed.
- See `docs/DOMAIN_MODEL.md` for assumptions, evidence semantics and Phase 2 visual direction.

The real-user security graph must not be persisted until the encryption/key-lifecycle threat review gate is resolved. The planned host for the later web interface is Vercel.

## Project documents

- **[Master plan](docs/MASTER_PLAN.md)** — purpose, distinctive interaction design, core graph/scenario engine, user and developer experiences, public-interest commitments, privacy requirements, phased milestones and acceptance criteria.
- **[Domain contract](docs/DOMAIN_MODEL.md)** — graph semantics, test fixtures, UX source references, Vercel assumption and privacy gates.
- **[Progress & handoff](docs/PROGRESS.md)** — current implementation status, task checklist, dated decisions, work log, and precise next action.

## Design priorities

1. **Beyond AI chat:** an editable and persistent security model; interactive what-if simulations, structure comparison, and explicit verification.
2. **Attack resistance + recoverability:** analysis considers adversarial reachability and the legitimate user's ability to regain access, separately.
3. **Trust through evidence:** unknown, inferred, self-reported, configured and tested states are not conflated.
4. **No vault or secret collection:** complements password managers and passkeys; does not custody passwords, private keys or recovery codes.
5. **Guest / mobile / local first:** public core guidance should remain free; no mandatory cloud backend or GitHub Actions.

See the [next planned task](docs/PROGRESS.md#immediate-recommended-next-unit-of-work). Do not treat unexecuted tests or planned features as verified or shipped.

## License

See [LICENSE](LICENSE) (MIT for this repository's software/documentation as included). Future public datasets or third-party contributions may need separately evaluated terms.
