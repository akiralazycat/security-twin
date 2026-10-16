import {
  compare, evaluate, proposeCandidate, SCHEMA_VERSION,
  type Comparison, type EvaluationReport, type GraphModel,
  type Scenario, type Status,
} from "./engine.ts";

/** This is deliberately fictional. Never present it as an actual provider's policy. */
export const DEMO_MODEL: GraphModel = {
  schemaVersion: SCHEMA_VERSION,
  configurationId: "fictional-baseline-v1",
  assets: [
    { id: "phone", label: "メインのスマートフォン", kind: "device", baseline: "available", evidenceId: "fictional" },
    { id: "mailbox", label: "メインメール", kind: "mailbox", baseline: "available", evidenceId: "fictional" },
    { id: "extra-check", label: "追加の本人確認", kind: "check", baseline: "unknown", evidenceId: "unconfirmed" },
  ],
  capabilities: [
    {
      id: "account-login", account: "架空のアカウント", kind: "login", actor: "owner",
      alternatives: [{ requires: ["phone"] }], evidenceId: "fictional",
    },
    {
      id: "account-recovery", account: "架空のアカウント", kind: "recover", actor: "owner",
      alternatives: [{ requires: ["mailbox", "extra-check"] }], evidenceId: "unconfirmed",
    },
    {
      id: "account-takeover", account: "架空のアカウント", kind: "takeover", actor: "attacker",
      alternatives: [{ requires: ["mailbox", "extra-check"] }], evidenceId: "unconfirmed",
    },
  ],
  evidence: [
    { id: "fictional", source: "illustrative", status: "unverified", notes: "学習用に仮定した構成" },
    { id: "unconfirmed", source: "illustrative", status: "unverified", notes: "本人確認の実際の条件は不明" },
  ],
};

export const DEMO_SCENARIOS = {
  normal: { id: "normal", assetStates: {} },
  lostPhone: { id: "lost-phone", assetStates: { phone: "lost" } },
  lostMailbox: { id: "lost-mailbox", assetStates: { mailbox: "unavailable" } },
  compromisedMailbox: { id: "compromised-mailbox", assetStates: { mailbox: "compromised" } },
} as const satisfies Record<string, Scenario>;

export type DemoScenarioKey = keyof typeof DEMO_SCENARIOS;

export function reportStatus(report: EvaluationReport, id: string): Status {
  const result = report.capabilities.find((item) => item.id === id);
  if (!result) throw new Error("Missing demo capability " + id);
  return result.status;
}

export function evaluateDemo(scenarioKey: DemoScenarioKey, proposedKey: boolean): {
  baseline: EvaluationReport;
  displayed: EvaluationReport;
  comparison: Comparison | null;
} {
  const scenario = DEMO_SCENARIOS[scenarioKey];
  if (!proposedKey) {
    const baseline = evaluate(DEMO_MODEL, scenario);
    return { baseline, displayed: baseline, comparison: null };
  }
  const candidate = proposeCandidate(DEMO_MODEL, {
    id: "fictional-candidate-with-independent-key",
    addAssets: [
      { id: "spare-key", label: "別の場所に保管した予備キー", kind: "authenticator", baseline: "available", evidenceId: "fictional" },
    ],
    replaceCapabilities: [
      {
        id: "account-login", account: "架空のアカウント", kind: "login", actor: "owner",
        alternatives: [{ requires: ["phone"] }, { requires: ["spare-key"] }], evidenceId: "fictional",
      },
    ],
  });
  const comparison = compare(DEMO_MODEL, candidate, scenario);
  return { baseline: comparison.baseline, displayed: comparison.candidate, comparison };
}
