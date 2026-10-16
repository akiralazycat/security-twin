import assert from "node:assert/strict";
import test from "node:test";
import {
  SCHEMA_VERSION, RULESET_VERSION,
  compare, evaluate, proposeCandidate, validateModel
} from "../src/engine.ts";

const asset = (id, kind = "authenticator", baseline = "available") =>
  ({ id, label: id, kind, baseline });
const cap = (id, kind, actor, alternatives) =>
  ({ id, account: "Fictional service", kind, actor, alternatives });
const and = (...requires) => ({ requires });
const model = (assets, capabilities, configurationId = "base-v1") =>
  ({ schemaVersion: SCHEMA_VERSION, configurationId, assets, capabilities, evidence: [] });
const scenario = (id, assetStates = {}) => ({ id, assetStates });
const outcome = (report, id) => report.capabilities.find((c) => c.id === id);
const lostPhone = scenario("phone-lost", { phone: "lost" });

test("lost phone blocks device-only login, without implying takeover", () => {
  const base = model(
    [asset("phone", "device")],
    [cap("owner-login", "login", "owner", [and("phone")]),
     cap("attacker-takeover", "takeover", "attacker", [and("phone")])]
  );
  const result = evaluate(base, lostPhone);
  assert.equal(result.schemaVersion, SCHEMA_VERSION);
  assert.equal(result.rulesetVersion, RULESET_VERSION);
  assert.equal(outcome(result, "owner-login").status, "unreachable");
  assert.equal(outcome(result, "attacker-takeover").status, "unreachable");
  assert.match(outcome(result, "owner-login").alternatives[0].requirements[0].reason, /lost/);
});

test("lost mailbox breaks explicitly declared mail-only recovery", () => {
  const base = model(
    [asset("mail", "mailbox")],
    [cap("owner-recovery", "recover", "owner", [and("mail")])]
  );
  assert.equal(outcome(evaluate(base, scenario("lost-mail", { mail: "unavailable" })), "owner-recovery").status, "unreachable");
});

test("compromised mailbox reaches only explicitly modeled takeover routes", () => {
  const base = model(
    [asset("mail", "mailbox"), asset("check", "check")],
    [cap("email-only", "takeover", "attacker", [and("mail")]),
     cap("extra-check", "takeover", "attacker", [and("mail", "check")]),
     cap("owner-login", "login", "owner", [and("mail")])]
  );
  const report = evaluate(base, scenario("compromise", { mail: "compromised" }));
  assert.equal(outcome(report, "email-only").status, "reachable");
  assert.equal(outcome(report, "extra-check").status, "unreachable");
  assert.equal(outcome(report, "owner-login").status, "reachable");
  assert.equal(outcome(report, "extra-check").alternatives[0].requirements.find(x => x.id === "check").status, "unreachable");
});

test("a proposed independent spare method helps without touching baseline", () => {
  const base = model(
    [asset("phone", "device")],
    [cap("login", "login", "owner", [and("phone")])]
  );
  const snapshot = JSON.stringify(base);
  const candidate = proposeCandidate(base, {
    id: "candidate-spare",
    addAssets: [asset("spare", "authenticator")],
    replaceCapabilities: [cap("login", "login", "owner", [and("phone"), and("spare")])]
  });
  const compared = compare(base, candidate, lostPhone);
  assert.equal(outcome(compared.baseline, "login").status, "unreachable");
  assert.equal(outcome(compared.candidate, "login").status, "reachable");
  assert.deepEqual(compared.changes, [{ capabilityId: "login", before: "unreachable", after: "reachable" }]);
  assert.equal(JSON.stringify(base), snapshot);
  assert.notStrictEqual(candidate.capabilities[0], base.capabilities[0]);
});

test("two authenticators sharing one device are not independent", () => {
  const base = model(
    [asset("phone", "device"), asset("sync-passkey"), asset("backup-passkey")],
    [cap("login", "login", "owner",
      [and("phone", "sync-passkey"), and("phone", "backup-passkey")])]
  );
  assert.equal(outcome(evaluate(base, lostPhone), "login").status, "unreachable");
});

test("unknown recovery evidence is neither safe nor proven unavailable", () => {
  const base = model(
    [asset("provider-check", "check", "unknown")],
    [cap("recover", "recover", "owner", [and("provider-check")]),
     cap("not-declared", "reenroll", "owner", [])]
  );
  const report = evaluate(base, scenario("normal"));
  assert.equal(outcome(report, "recover").status, "unknown");
  assert.equal(outcome(report, "not-declared").status, "unknown");
});

test("unsupported capability cycle remains unknown, independent anchor resolves cycle", () => {
  const locked = model([], [
    cap("a", "recover", "owner", [and("b")]),
    cap("b", "reenroll", "owner", [and("a")])
  ]);
  assert.equal(outcome(evaluate(locked, scenario("normal")), "a").status, "unknown");
  const anchored = model([asset("key")], [
    cap("b", "reenroll", "owner", [and("a")]),
    cap("a", "recover", "owner", [and("b"), and("key")])
  ]);
  assert.equal(outcome(evaluate(anchored, scenario("normal")), "a").status, "reachable");
  assert.equal(outcome(evaluate(anchored, scenario("normal")), "b").status, "reachable");
});

test("threshold 2-of-3 handles true, false and unknown", () => {
  const base = model(
    [asset("one"), asset("two"), asset("three")],
    [cap("reset", "reenroll", "owner", [{ requires: ["one", "two", "three"], minimum: 2 }])]
  );
  const status = (s) => outcome(evaluate(base, s), "reset").status;
  assert.equal(status(scenario("one-lost", { one: "lost" })), "reachable");
  assert.equal(status(scenario("two-lost", { one: "lost", two: "unavailable" })), "unreachable");
  assert.equal(status(scenario("one-lost-one-unknown", { one: "lost", two: "unknown" })), "unknown");
});

test("evidence remains metadata; even verified evidence does not change graph outcome", () => {
  const base = model([asset("key")], [cap("login", "login", "owner", [and("key")])]);
  base.evidence.push({ id: "e1", source: "self-reported", status: "reported" });
  base.capabilities[0].evidenceId = "e1";
  let report = evaluate(base, scenario("normal"));
  assert.equal(outcome(report, "login").evidenceId, "e1");
  const before = outcome(report, "login").status;
  base.evidence[0].status = "verified";
  report = evaluate(base, scenario("normal"));
  assert.equal(outcome(report, "login").status, before);
});

test("deterministic replay / independent declaration order / JSON round trip", () => {
  const base = model(
    [asset("phone", "device"), asset("key")],
    [cap("a", "login", "owner", [and("phone")]), cap("b", "recover", "owner", [and("a"), and("key")])]
  );
  const original = evaluate(base, lostPhone);
  const second = evaluate(JSON.parse(JSON.stringify(base)), lostPhone);
  assert.deepEqual(second, original);
  const permuted = structuredClone(base);
  permuted.capabilities.reverse();
  permuted.assets.reverse();
  assert.deepEqual(evaluate(permuted, lostPhone), original);
});

test("validation rejects unbound references, thresholds, actor-crossing and oversized inputs", () => {
  const base = model([asset("phone", "device")], [cap("login", "login", "owner", [and("phone")])]);
  validateModel(base);
  assert.throws(() => evaluate(base, scenario("invalid", { nonexistent: "lost" })), /scenario asset/);
  assert.throws(() => evaluate(base, scenario("invalid", { phone: "hacked" })), /scenario asset/);
  assert.throws(() => validateModel(model([], [cap("login", "login", "owner", [and("missing")])])), /missing prerequisite/);
  assert.throws(() => validateModel(model([asset("key")], [cap("login", "login", "owner", [{ requires: ["key"], minimum: 0 }])])), /threshold/);
  assert.throws(() => validateModel(model([], [cap("a", "login", "owner", [and("b")]), cap("b", "takeover", "attacker", [])])), /cross-actor/);
  assert.throws(() => validateModel(model([asset("phone"), asset("phone")], [])), /duplicate/);
  assert.throws(() => validateModel(model(Array.from({ length: 257 }, (_, i) => asset("id" + i)), [])), /asset count/);
});

test("unrelated disconnected asset has no effect on a report", () => {
  const base = model([asset("phone", "device")], [cap("login", "login", "owner", [and("phone")])]);
  const expanded = structuredClone(base);
  expanded.assets.push(asset("independent-provider", "provider"));
  assert.deepEqual(evaluate(base, lostPhone).capabilities, evaluate(expanded, lostPhone).capabilities);
});
