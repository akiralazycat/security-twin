/**
 * Security Twin Phase 1 — pure, fictional dependency evaluator.
 * No network, persistence, secrets, account edits or provider-specific guarantees.
 * Contract: docs/DOMAIN_MODEL.md
 */
export const SCHEMA_VERSION = "security-twin/v1" as const;
export const RULESET_VERSION = "phase1-1" as const;

export type Status = "reachable" | "unreachable" | "unknown";
export type Actor = "owner" | "attacker";
export type CapabilityKind =
  | "login"
  | "recover"
  | "reenroll"
  | "change-settings"
  | "takeover";
export type AssetKind =
  | "device"
  | "mailbox"
  | "authenticator"
  | "provider"
  | "check"
  | "other";
export type EvidenceSource =
  | "illustrative"
  | "self-reported"
  | "official-documentation"
  | "tested";
export type EvidenceStatus = "unverified" | "reported" | "verified" | "stale";

export interface Evidence {
  id: string;
  source: EvidenceSource;
  status: EvidenceStatus;
  sourceUrl?: string;
  observedAt?: string;
  checkedAt?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  label: string;
  kind: AssetKind;
  baseline: "available" | "unknown";
  evidenceId?: string;
}

export interface PrerequisiteGroup {
  /** At least minimum of these asset/capability IDs must be reachable. */
  requires: string[];
  /** Omitted means all prerequisites (AND). */
  minimum?: number;
}

export interface Capability {
  id: string;
  account: string;
  kind: CapabilityKind;
  actor: Actor;
  /** OR across groups; empty list means unknown, not automatically granted. */
  alternatives: PrerequisiteGroup[];
  evidenceId?: string;
}

export interface GraphModel {
  schemaVersion: typeof SCHEMA_VERSION;
  configurationId: string;
  assets: Asset[];
  capabilities: Capability[];
  evidence: Evidence[];
}

export type ScenarioState = "lost" | "unavailable" | "compromised" | "unknown";
export interface Scenario {
  id: string;
  assetStates: Record<string, ScenarioState>;
}

export interface RequirementTrace {
  id: string;
  status: Status;
  reason: string;
}
export interface GroupResult {
  status: Status;
  minimum: number;
  requirements: RequirementTrace[];
}
export interface CapabilityResult {
  id: string;
  account: string;
  kind: CapabilityKind;
  actor: Actor;
  status: Status;
  evidenceId?: string;
  reason: string;
  alternatives: GroupResult[];
}
export interface EvaluationReport {
  schemaVersion: typeof SCHEMA_VERSION;
  rulesetVersion: typeof RULESET_VERSION;
  configurationId: string;
  scenarioId: string;
  capabilities: CapabilityResult[];
}
export interface CandidateChange {
  id: string;
  addAssets?: Asset[];
  addCapabilities?: Capability[];
  replaceCapabilities?: Capability[];
}
export interface Comparison {
  baseline: EvaluationReport;
  candidate: EvaluationReport;
  changes: Array<{
    capabilityId: string;
    before: Status | "absent";
    after: Status | "absent";
  }>;
}

const MAX_ASSETS = 256;
const MAX_CAPABILITIES = 256;
const MAX_GROUPS = 24;
const MAX_REQUIRES = 32;

function must(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error("Invalid Security Twin model: " + message);
}
function validId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,79}$/.test(value);
}
function validString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160;
}

export function validateModel(model: GraphModel): void {
  must(model && model.schemaVersion === SCHEMA_VERSION, "schema version");
  must(validId(model.configurationId), "configuration ID");
  must(Array.isArray(model.assets) && model.assets.length <= MAX_ASSETS, "asset count");
  must(Array.isArray(model.capabilities) && model.capabilities.length <= MAX_CAPABILITIES, "capability count");
  must(Array.isArray(model.evidence) && model.evidence.length <= MAX_ASSETS + MAX_CAPABILITIES, "evidence count");

  const allowedKinds = ["device", "mailbox", "authenticator", "provider", "check", "other"];
  const allowedCapabilities = ["login", "recover", "reenroll", "change-settings", "takeover"];
  const allowedSources = ["illustrative", "self-reported", "official-documentation", "tested"];
  const allowedEvidenceStatuses = ["unverified", "reported", "verified", "stale"];
  const ids = new Set<string>();
  const evidenceIds = new Set<string>();
  for (const evidence of model.evidence) {
    must(evidence && validId(evidence.id) && !evidenceIds.has(evidence.id), "duplicate or invalid evidence ID");
    must(allowedSources.includes(evidence.source) && allowedEvidenceStatuses.includes(evidence.status), "evidence category");
    if (evidence.sourceUrl !== undefined) {
      must(typeof evidence.sourceUrl === "string" && /^https:\/\//.test(evidence.sourceUrl) && evidence.sourceUrl.length <= 2048, "evidence URL");
    }
    evidenceIds.add(evidence.id);
  }
  for (const asset of model.assets) {
    must(asset && validId(asset.id) && !ids.has(asset.id), "duplicate or invalid asset ID");
    must(validString(asset.label) && allowedKinds.includes(asset.kind), "asset label or kind");
    must(asset.baseline === "available" || asset.baseline === "unknown", "asset availability");
    if (asset.evidenceId !== undefined) must(evidenceIds.has(asset.evidenceId), "missing asset evidence");
    ids.add(asset.id);
  }
  for (const capability of model.capabilities) {
    must(capability && validId(capability.id) && !ids.has(capability.id), "duplicate or invalid capability ID");
    must(validString(capability.account) && allowedCapabilities.includes(capability.kind), "account or capability kind");
    must(capability.actor === "owner" || capability.actor === "attacker", "actor");
    must(Array.isArray(capability.alternatives) && capability.alternatives.length <= MAX_GROUPS, "alternative count");
    if (capability.evidenceId !== undefined) must(evidenceIds.has(capability.evidenceId), "missing capability evidence");
    ids.add(capability.id);
  }
  const capabilities = new Map(model.capabilities.map((capability) => [capability.id, capability]));
  for (const capability of model.capabilities) {
    for (const group of capability.alternatives) {
      must(group && Array.isArray(group.requires) && group.requires.length >= 1 && group.requires.length <= MAX_REQUIRES, "requirement count");
      const min = group.minimum ?? group.requires.length;
      must(Number.isInteger(min) && min >= 1 && min <= group.requires.length, "threshold");
      must(new Set(group.requires).size === group.requires.length, "repeated prerequisite");
      for (const id of group.requires) {
        must(ids.has(id), "missing prerequisite: " + id);
        const prerequisiteCapability = capabilities.get(id);
        must(!prerequisiteCapability || prerequisiteCapability.actor === capability.actor, "cross-actor capability dependency");
      }
    }
  }
}

function assetStatus(
  asset: Asset,
  actor: Actor,
  state: ScenarioState | undefined
): Status {
  if (state === "unknown" || (state === undefined && asset.baseline === "unknown")) {
    return "unknown";
  }
  if (actor === "attacker") return state === "compromised" ? "reachable" : "unreachable";
  if (state === "lost" || state === "unavailable") return "unreachable";
  return "reachable"; // "compromised" alone does not assert owner lockout
}

function groupStatus(statuses: Status[], minimum: number): Status {
  const reachable = statuses.filter((status) => status === "reachable").length;
  const unknown = statuses.filter((status) => status === "unknown").length;
  if (reachable >= minimum) return "reachable";
  if (reachable + unknown < minimum) return "unreachable";
  return "unknown";
}

function aggregate(statuses: Status[]): Status {
  if (!statuses.length) return "unknown";
  if (statuses.includes("reachable")) return "reachable";
  if (statuses.every((status) => status === "unreachable")) return "unreachable";
  return "unknown";
}

export function evaluate(model: GraphModel, scenario: Scenario): EvaluationReport {
  validateModel(model);
  must(scenario && validId(scenario.id) && scenario.assetStates !== null &&
    typeof scenario.assetStates === "object" && !Array.isArray(scenario.assetStates), "scenario");
  const assets = new Map(model.assets.map((asset) => [asset.id, asset]));
  for (const [id, state] of Object.entries(scenario.assetStates)) {
    must(assets.has(id) && ["lost", "unavailable", "compromised", "unknown"].includes(state), "scenario asset/state");
  }
  const caps = new Map(model.capabilities.map((cap) => [cap.id, cap]));
  let values = new Map<string, Status>(model.capabilities.map((cap) => [cap.id, "unknown"]));
  function lookup(id: string, actor: Actor, previous: Map<string, Status>): Status {
    const asset = assets.get(id);
    return asset ? assetStatus(asset, actor, scenario.assetStates[id]) : (previous.get(id) ?? "unknown");
  }
  // Positive AND/OR/threshold graph: known results propagate from unknown.
  // Unsupported cycles remain unknown; the bounded fixed point is declaration-order independent.
  for (let iteration = 0; iteration <= model.capabilities.length; iteration++) {
    const next = new Map<string, Status>();
    for (const cap of model.capabilities) {
      next.set(cap.id, aggregate(cap.alternatives.map((group) =>
        groupStatus(group.requires.map((id) => lookup(id, cap.actor, values)), group.minimum ?? group.requires.length)
      )));
    }
    const changed = [...next.keys()].some((id) => next.get(id) !== values.get(id));
    values = next;
    if (!changed) break;
  }
  const results = [...caps.values()].sort((a, b) => a.id.localeCompare(b.id, "en")).map((cap): CapabilityResult => {
    const alternatives = cap.alternatives.map((group): GroupResult => {
      const requirements = group.requires.map((id): RequirementTrace => {
        const status = lookup(id, cap.actor, values);
        const asset = assets.get(id);
        const scenarioState = scenario.assetStates[id];
        let reason: string;
        if (asset) {
          reason = scenarioState ? "Asset scenario: " + scenarioState
            : "Baseline assumed: " + asset.baseline;
        } else {
          reason = "Dependent " + (caps.get(id)?.kind ?? "capability") + " capability";
        }
        return { id, status, reason };
      });
      const minimum = group.minimum ?? group.requires.length;
      return { minimum, requirements, status: groupStatus(requirements.map((r) => r.status), minimum) };
    });
    const status = values.get(cap.id) ?? "unknown";
    const reason = alternatives.length === 0 ? "No asserted access path"
      : status === "reachable" ? "At least one declared path is reachable"
      : status === "unreachable" ? "All declared paths are unavailable under the scenario"
      : "A prerequisite is unknown or a dependency cycle is unresolved";
    return { id: cap.id, account: cap.account, kind: cap.kind, actor: cap.actor, status, reason, alternatives, ...(cap.evidenceId ? { evidenceId: cap.evidenceId } : {}) };
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    rulesetVersion: RULESET_VERSION,
    configurationId: model.configurationId,
    scenarioId: scenario.id,
    capabilities: results
  };
}

/** A new in-memory configuration only. No version is marked configured or verified. */
export function proposeCandidate(baseline: GraphModel, change: CandidateChange): GraphModel {
  validateModel(baseline);
  must(validId(change.id), "candidate ID");
  const candidate: GraphModel = structuredClone(baseline);
  candidate.configurationId = change.id;
  candidate.assets.push(...structuredClone(change.addAssets ?? []));
  candidate.capabilities.push(...structuredClone(change.addCapabilities ?? []));
  for (const replacement of change.replaceCapabilities ?? []) {
    const index = candidate.capabilities.findIndex((capability) => capability.id === replacement.id);
    must(index !== -1, "replacement target missing");
    candidate.capabilities[index] = structuredClone(replacement);
  }
  validateModel(candidate);
  return candidate;
}

export function compare(baseline: GraphModel, candidate: GraphModel, scenario: Scenario): Comparison {
  const before = evaluate(baseline, scenario);
  const after = evaluate(candidate, scenario);
  const oldStatuses = new Map(before.capabilities.map((cap) => [cap.id, cap.status]));
  const newStatuses = new Map(after.capabilities.map((cap) => [cap.id, cap.status]));
  const changedIds = [...new Set([...oldStatuses.keys(), ...newStatuses.keys()])].sort();
  return {
    baseline: before,
    candidate: after,
    changes: changedIds
      .filter((id) => oldStatuses.get(id) !== newStatuses.get(id))
      .map((id) => ({ capabilityId: id, before: oldStatuses.get(id) ?? "absent", after: newStatuses.get(id) ?? "absent" }))
  };
}
