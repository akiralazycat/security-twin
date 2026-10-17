import assert from "node:assert/strict";
import test from "node:test";
import { INITIAL_SESSION_ANSWERS, evaluateSession, sessionModel } from "../src/profile.ts";
import { DEMO_MODEL, evaluateDemo, reportStatus } from "../src/demo.ts";

const possible = ["yes", "no", "unknown"];

test("empty/unknown session answers preserve uncertainty without disclosing identifiers", () => {
  assert.deepEqual(INITIAL_SESSION_ANSWERS, { otherLogin: "unknown", otherRecovery: "unknown" });
  const graph = sessionModel(INITIAL_SESSION_ANSWERS);
  assert.ok(graph.assets.every((x) => !x.label.includes("@")));
  assert.equal(graph.evidence.find((x) => x.id === "self-report").status, "reported");
  assert.equal(graph.assets.find((x) => x.id === "spare-key").baseline, "unknown");
  assert.equal(graph.assets.find((x) => x.id === "alternate-recovery").baseline, "unknown");
  assert.equal(reportStatus(evaluateSession(INITIAL_SESSION_ANSWERS, "lostPhone", false).displayed, "account-login"), "unknown");
});

test("all nine combinations: owner access loss remains conditional on stated alternatives", () => {
  const snapshot = JSON.stringify(DEMO_MODEL);
  for (const otherLogin of possible) {
    for (const otherRecovery of possible) {
      const answers = { otherLogin, otherRecovery };
      const phone = evaluateSession(answers, "lostPhone", false);
      const mailbox = evaluateSession(answers, "lostMailbox", false);
      const expected = (answer) => answer === "yes" ? "reachable" : answer === "no" ? "unreachable" : "unknown";
      assert.equal(reportStatus(phone.displayed, "account-login"), expected(otherLogin), JSON.stringify(answers));
      assert.equal(reportStatus(mailbox.displayed, "account-recovery"), expected(otherRecovery), JSON.stringify(answers));
      assert.equal(reportStatus(phone.displayed, "account-takeover"), "unreachable", JSON.stringify(answers));
      assert.equal(reportStatus(evaluateSession(answers, "compromisedMailbox", false).displayed, "account-takeover"), "unknown");
      assert.equal(phone.displayed.configurationId, `session-abstract-${otherLogin}-${otherRecovery}`);
      assert.equal(JSON.stringify(DEMO_MODEL), snapshot);
    }
  }
});

test("hypothetical key is a separate, unverified candidate with immutable baseline", () => {
  const answers = { otherLogin: "unknown", otherRecovery: "no" };
  const graph = sessionModel(answers);
  const snapshot = JSON.stringify(graph);
  const c = evaluateSession(answers, "lostPhone", true);
  assert.equal(reportStatus(c.baseline, "account-login"), "unknown");
  assert.equal(reportStatus(c.displayed, "account-login"), "reachable");
  const hypo = c.displayed.capabilities.find((x) => x.id === "account-login");
  assert.equal(hypo.evidenceId, "hypothetical");
  assert.deepEqual(c.comparison?.changes, [{ capabilityId: "account-login", before: "unknown", after: "reachable" }]);
  assert.equal(JSON.stringify(graph), snapshot);
  assert.equal(graph.assets.find((x) => x.id === "spare-key").baseline, "unknown");
});

test("explicit no alternative still allows a hypothetical independent key", () => {
  const answers = { otherLogin: "no", otherRecovery: "no" };
  const result = evaluateSession(answers, "lostPhone", true);
  assert.equal(reportStatus(result.baseline, "account-login"), "unreachable");
  assert.equal(reportStatus(result.displayed, "account-login"), "reachable");
  assert.equal(result.displayed.capabilities.find((x) => x.id === "account-login").alternatives.length, 2);
});

test("recovery claim never grants attacker takeover or changes separate owner login", () => {
  for (const otherRecovery of possible) {
    const answers = { otherLogin: "no", otherRecovery };
    const report = evaluateSession(answers, "compromisedMailbox", false).displayed;
    assert.equal(reportStatus(report, "account-takeover"), "unknown");
    assert.equal(reportStatus(report, "account-login"), "reachable");
  }
});

test("invalid values are rejected; no options are saved in storage or URL by adapter", () => {
  assert.throws(() => sessionModel({ otherLogin: "maybe", otherRecovery: "yes" }), /Invalid session answers/);
  assert.throws(() => sessionModel({ otherLogin: "yes", otherRecovery: undefined }), /Invalid session answers/);
  // The pure adapter has no browser API. Refresh behavior is enforced in the UI by React-only useState.
  const before = evaluateDemo("lostPhone", false).baseline;
  evaluateSession({ otherLogin: "yes", otherRecovery: "yes" }, "lostPhone", true);
  assert.deepEqual(evaluateDemo("lostPhone", false).baseline, before);
});
