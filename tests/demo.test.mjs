import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_MODEL, evaluateDemo, reportStatus } from "../src/demo.ts";

test("guest sample starts with no identifying information or secrets", () => {
  assert.equal(DEMO_MODEL.configurationId, "fictional-baseline-v1");
  assert.equal(DEMO_MODEL.assets.length, 3);
  assert.equal(DEMO_MODEL.assets.some((item) => item.id.includes("@")), false);
  assert.equal(DEMO_MODEL.evidence.every((item) => item.status === "unverified"), true);
});

test("guest phone-loss scenario visibly blocks baseline login", () => {
  const report = evaluateDemo("lostPhone", false);
  assert.equal(report.comparison, null);
  assert.equal(reportStatus(report.baseline, "account-login"), "unreachable");
  assert.equal(reportStatus(report.baseline, "account-recovery"), "unknown");
  assert.equal(reportStatus(report.baseline, "account-takeover"), "unreachable");
});

test("proposed independent key preserves original result and restores hypothetical login", () => {
  const baselineJson = JSON.stringify(DEMO_MODEL);
  const result = evaluateDemo("lostPhone", true);
  assert.equal(reportStatus(result.baseline, "account-login"), "unreachable");
  assert.equal(reportStatus(result.displayed, "account-login"), "reachable");
  assert.deepEqual(result.comparison?.changes, [{ capabilityId: "account-login", before: "unreachable", after: "reachable" }]);
  assert.equal(JSON.stringify(DEMO_MODEL), baselineJson);
});

test("mailbox loss blocks recovery without implying login failure", () => {
  const report = evaluateDemo("lostMailbox", false).displayed;
  assert.equal(reportStatus(report, "account-recovery"), "unreachable");
  assert.equal(reportStatus(report, "account-login"), "reachable");
});

test("compromised mailbox alone leaves takeover outcome unknown", () => {
  const report = evaluateDemo("compromisedMailbox", false).displayed;
  assert.equal(reportStatus(report, "account-takeover"), "unknown");
  assert.equal(reportStatus(report, "account-login"), "reachable");
});

test("resetting the proposed key reverts exactly to the original baseline", () => {
  const first = evaluateDemo("normal", false);
  evaluateDemo("normal", true);
  const last = evaluateDemo("normal", false);
  assert.deepEqual(last, first);
});
