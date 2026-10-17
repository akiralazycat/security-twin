import {
  compare, evaluate, proposeCandidate, type Comparison,
  type EvaluationReport, type GraphModel, type Scenario,
} from "./engine.ts";
import { DEMO_MODEL, DEMO_SCENARIOS, type DemoScenarioKey } from "./demo.ts";

/** Three non-identifying assertions, never proof of actual provider behavior. */
export type StatedAvailability = "yes" | "no" | "unknown";
export interface SessionAnswers {
  otherLogin: StatedAvailability;
  otherRecovery: StatedAvailability;
}

export const INITIAL_SESSION_ANSWERS: Readonly<SessionAnswers> = Object.freeze({
  otherLogin: "unknown",
  otherRecovery: "unknown",
});

export interface ProfileEvaluation {
  baseline: EvaluationReport;
  displayed: EvaluationReport;
  comparison: Comparison | null;
}

function checkAnswers(answers: SessionAnswers): void {
  if (!answers || !["yes", "no", "unknown"].includes(answers.otherLogin)
    || !["yes", "no", "unknown"].includes(answers.otherRecovery)) {
    throw new Error("Invalid session answers");
  }
}

function statedAsset(
  id: "spare-key" | "alternate-recovery",
  label: string, availability: StatedAvailability
): GraphModel["assets"][number] {
  return {
    id,
    label,
    kind: "other",
    baseline: availability === "yes" ? "available" : "unknown",
    evidenceId: "self-report",
  };
}

/**
 * A model of stated prerequisites, not a provider-specific risk assessment.
 * This function does not write storage or invoke any network action.
 */
export function sessionModel(answers: SessionAnswers): GraphModel {
  checkAnswers(answers);
  const graph: GraphModel = structuredClone(DEMO_MODEL);
  graph.configurationId = `session-abstract-${answers.otherLogin}-${answers.otherRecovery}`;
  graph.capabilities = graph.capabilities.map((capability) => ({
    ...capability,
    account: "モデル上のアカウント",
  }));
  graph.evidence.push({
    id: "self-report",
    source: "self-reported",
    status: "reported",
    notes: "選択した前提。対象サービス側での登録・利用・独立性は未検証",
  });
  if (answers.otherLogin !== "no") {
    graph.assets.push(statedAsset("spare-key", "端末とは別のログイン経路", answers.otherLogin));
    const login = graph.capabilities.find((capability) => capability.id === "account-login");
    if (!login) throw new Error("Missing model login capability");
    login.alternatives.push({ requires: ["spare-key"] });
    login.evidenceId = "self-report";
  }
  if (answers.otherRecovery !== "no") {
    graph.assets.push(statedAsset("alternate-recovery", "メールとは別の復旧経路", answers.otherRecovery));
    const recovery = graph.capabilities.find((capability) => capability.id === "account-recovery");
    if (!recovery) throw new Error("Missing model recovery capability");
    recovery.alternatives.push({ requires: ["alternate-recovery"] });
    recovery.evidenceId = "self-report";
  }
  return graph;
}

export function evaluateSession(
  answers: SessionAnswers,
  scenarioKey: DemoScenarioKey,
  hypotheticalKey: boolean
): ProfileEvaluation {
  const base = sessionModel(answers);
  const scenario: Scenario = DEMO_SCENARIOS[scenarioKey];
  if (!hypotheticalKey) {
    const baseline = evaluate(base, scenario);
    return { baseline, displayed: baseline, comparison: null };
  }

  // A new hypothetical key is distinct from any user-stated alternative.
  // In particular, "unknown" must NOT be converted into confirmed "yes".
  const candidateBase: GraphModel = structuredClone(base);
  candidateBase.evidence.push({ id: "hypothetical", source: "illustrative", status: "unverified", notes: "画面上で仮定した追加の手段" });
  const candidate = proposeCandidate(candidateBase, {
    id: `candidate-${base.configurationId}`,
    addAssets: [{
      id: "hypothetical-key",
      label: "仮に独立して登録した追加のセキュリティキー",
      kind: "authenticator",
      baseline: "available",
      evidenceId: "hypothetical",
    }],
    addCapabilities: [],
    replaceCapabilities: base.capabilities.map((capability) => {
      if (capability.id !== "account-login") return capability;
      return {
        ...capability,
        alternatives: [...capability.alternatives, { requires: ["hypothetical-key"] }],
        evidenceId: "hypothetical",
      };
    }).filter((capability) => capability.id === "account-login"),
  });
  // Proposed evidence cannot be silently marked verified.
  // Candidate's hypothetical asset refers to an illustration record.
  const comparison = compare(base, candidate, scenario);
  return {
    baseline: comparison.baseline,
    displayed: comparison.candidate,
    comparison,
  };
}
