import assert from "node:assert/strict";
import test from "node:test";
import { cascadeLines, playbook } from "../src/clarity.ts";

test("lost phone cascade keeps login failure separate from recovery and takeover", () => {
  const lines = cascadeLines({
    scenario: "lostPhone", login: "unreachable", recovery: "unknown", takeover: "unreachable",
  });
  assert.equal(lines.length, 4);
  assert.match(lines[0], /スマートフォン/);
  assert.match(lines[1], /利用できない/);
  assert.match(lines[2], /判断できない/);
  assert.match(lines[2], /別/);
  assert.match(lines[3], /不成立/);
  assert.equal(lines.join(" ").includes("http"), false);
});

test("compromised mailbox cascade does not call takeover proven", () => {
  const lines = cascadeLines({
    scenario: "compromisedMailbox", login: "reachable", recovery: "unknown", takeover: "unknown",
  });
  assert.match(lines[0], /別/);
  assert.match(lines[3], /不明/);
  assert.equal(lines[3].includes("成立した"), false);
});

test("every playbook is three unperformed real-world checks and no secret request", () => {
  for (const scenario of ["normal", "lostPhone", "lostMailbox", "compromisedMailbox"]) {
    const steps = playbook(scenario);
    assert.equal(steps.length, 3);
    const text = steps.map((step) => step.title + step.detail).join(" ");
    assert.match(text, /未実施|開きません|ことにはなりません|計画/);
    assert.equal(/password|パスワードを入力|recovery code|http/i.test(text), false);
  }
});
