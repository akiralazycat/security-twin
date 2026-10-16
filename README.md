# Security Twin

**Explore, simulate and verify the resilience of your digital identity.**

Security Twin is a planned mobile-first, local-first workspace for mapping account, device, passkey, password-manager and recovery dependencies. It helps individuals understand how a loss or compromise propagates, compare hypothetical security configurations, and verify actual improvements. A shared analysis engine is intended to support a future developer workspace and open public security commons.

**Status (2026-10-17): planning only.** There is no functional application in this repository yet.

## Project documents

- **[Master plan](docs/MASTER_PLAN.md)** — purpose, distinctive interaction design, core graph/scenario engine, user and developer experiences, public-interest commitments, privacy requirements, phased milestones and acceptance criteria.
- **[Progress & handoff](docs/PROGRESS.md)** — current implementation status, task checklist, dated decisions, work log, and precise next action.

## Design priorities

1. **Beyond AI chat:** an editable and persistent security model; interactive what-if simulations, structure comparison, and explicit verification.
2. **Attack resistance + recoverability:** analysis considers adversarial reachability and the legitimate user's ability to regain access, separately.
3. **Trust through evidence:** unknown, inferred, self-reported, configured and tested states are not conflated.
4. **No vault or secret collection:** complements password managers and passkeys; does not custody passwords, private keys or recovery codes.
5. **Guest / mobile / local first:** public core guidance should remain free; no mandatory cloud backend or GitHub Actions.

See the [next planned task](docs/PROGRESS.md#immediate-recommended-next-unit-of-work). Do not treat planned features as shipped.

## License

See [LICENSE](LICENSE) (MIT for this repository's software/documentation as included). Future public datasets or third-party contributions may need separately evaluated terms.
