"use client";

import { useMemo, useState } from "react";
import {
  DEMO_MODEL, DEMO_SCENARIOS, evaluateDemo, reportStatus,
  type DemoScenarioKey,
} from "../src/demo";
import type { CapabilityResult, Status } from "../src/engine";

type NodeId = "phone" | "mailbox" | "spare-key" | "extra-check" | "account";

const SCENARIO_OPTIONS: { key: DemoScenarioKey; label: string; detail: string }[] = [
  { key: "normal", label: "通常", detail: "すべての既知の手段が使える想定" },
  { key: "lostPhone", label: "端末を紛失", detail: "スマートフォンからアクセスできない" },
  { key: "lostMailbox", label: "メールが使えない", detail: "復旧用メールを利用できない" },
  { key: "compromisedMailbox", label: "メールが侵害", detail: "第三者がメールを操作できると仮定" },
];

const LABELS: Record<NodeId, { title: string; kind: string; detail: string }> = {
  phone: {
    title: "スマートフォン", kind: "端末",
    detail: "この架空のアカウントは、スマートフォンにある認証方法を使って通常ログインします。",
  },
  mailbox: {
    title: "メインメール", kind: "復旧先",
    detail: "アカウント復旧には、このメールと追加の本人確認が必要だと仮定しています。",
  },
  "spare-key": {
    title: "独立した予備キー", kind: "仮の変更",
    detail: "メイン端末とは別の場所で保管し、対象サービスに登録できるという仮定で比較します。",
  },
  "extra-check": {
    title: "追加の本人確認", kind: "未確認の条件",
    detail: "本人確認の方法や成否は分かりません。このため、復旧や乗っ取りの可能性は断定できません。",
  },
  account: {
    title: "架空のアカウント", kind: "確認対象",
    detail: "ログイン、復旧、第三者による乗っ取りを、それぞれ別の条件として評価しています。",
  },
};

function findResult(capabilities: CapabilityResult[], id: string): CapabilityResult {
  const item = capabilities.find((entry) => entry.id === id);
  if (!item) throw new Error("Missing demo capability: " + id);
  return item;
}

function requirementStatus(capabilities: CapabilityResult[], id: string): Status {
  for (const capability of capabilities) {
    for (const alternative of capability.alternatives) {
      const req = alternative.requirements.find((item) => item.id === id);
      if (req) return req.status;
    }
  }
  return "unknown";
}

function ownerWord(status: Status): string {
  if (status === "reachable") return "利用できる";
  if (status === "unreachable") return "利用できない";
  return "判断できない";
}

function attackerWord(status: Status): string {
  if (status === "reachable") return "想定した経路が成立";
  if (status === "unreachable") return "想定した経路は不成立";
  return "成立するか不明";
}

function StatusMark({ status }: { status: Status }) {
  return <span className={"status-mark status-" + status} aria-hidden="true" />;
}

function MiniArrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function SecuritySymbol() {
  return <svg viewBox="0 0 40 40" width="29" height="29" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" opacity=".48" />
    <circle cx="20" cy="20" r="7" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 4v9M35.5 20H27M20 36v-9M4.5 20H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2.2" fill="currentColor" />
  </svg>;
}

export default function SecurityWorkspace() {
  const [scenario, setScenario] = useState<DemoScenarioKey>("lostPhone");
  const [proposed, setProposed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeId>("phone");

  const results = useMemo(() => evaluateDemo(scenario, proposed), [scenario, proposed]);
  const displayed = results.displayed;
  const login = findResult(displayed.capabilities, "account-login");
  const recovery = findResult(displayed.capabilities, "account-recovery");
  const takeover = findResult(displayed.capabilities, "account-takeover");
  const beforeLogin = reportStatus(results.baseline, "account-login");
  const phone = requirementStatus(displayed.capabilities, "phone");
  const mailbox = requirementStatus(displayed.capabilities, "mailbox");
  const spare = proposed ? requirementStatus(displayed.capabilities, "spare-key") : "unknown";
  const check = requirementStatus(displayed.capabilities, "extra-check");
  const changed = beforeLogin !== login.status;
  const activeScenario = SCENARIO_OPTIONS.find((option) => option.key === scenario)!;
  const selected = LABELS[selectedNode];

  const nodes: { id: NodeId; title: string; eyebrow: string; status: Status; description: string }[] = [
    { id: "phone", title: "スマートフォン", eyebrow: "ログイン手段", status: phone, description: ownerWord(phone) },
    { id: "mailbox", title: "メインメール", eyebrow: "復旧先", status: mailbox, description: scenario === "compromisedMailbox" ? "侵害を想定" : ownerWord(mailbox) },
    { id: "spare-key", title: "予備キー", eyebrow: "別の場所", status: spare, description: proposed ? "仮に追加" : "未追加" },
    { id: "account", title: "架空のアカウント", eyebrow: "通常ログイン", status: login.status, description: ownerWord(login.status) },
  ];

  return (
    <div className="site">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Security Twin トップ">
          <span className="brand-symbol"><SecuritySymbol /></span>
          <span>Security <strong>Twin</strong></span>
        </a>
        <nav className="header-nav" aria-label="ページ内の移動">
          <a href="#workspace">シミュレーション</a>
          <a href="#approach">仕組み</a>
        </nav>
        <span className="header-edition">PREVIEW · 架空の構成</span>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-text">
            <span className="eyebrow"><span className="eyebrow-line" /> SECURITY ATLAS / 01</span>
            <h1>もし、スマートフォンを<br className="desktop-break" />失ったら。</h1>
            <p className="intro-lead">いつものログインが使えなくなったとき、ほかにどんな経路が残るのか。端末・メール・認証手段のつながりを変えながら、確かめられます。</p>
            <div className="intro-actions">
              <a className="primary-link" href="#workspace">経路を試す <MiniArrow /></a>
              <span>登録不要 · 架空の例を使用</span>
            </div>
          </div>
          <div className="intro-visual" aria-hidden="true">
            <div className="orbital orbital-one" /><div className="orbital orbital-two" />
            <div className="orbital orbital-three" />
            <div className="orbital-center"><SecuritySymbol /></div>
            <div className="orbital-point one" /><div className="orbital-point two" />
            <div className="orbital-point three" />
            <span className="orbital-label upper">IDENTITY / DEPENDENCY</span>
            <span className="orbital-label lower">01 — WHAT IF</span>
          </div>
        </section>

        <section className="workspace" id="workspace" aria-labelledby="workspace-title">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">INTERACTIVE WORKSPACE</span>
              <h2 id="workspace-title">経路をたどる</h2>
              <p>ひとつの架空の構成で、状況を変えてみます。各ノードを選ぶと、役割を確認できます。</p>
            </div>
            <span className="sample-flag"><span className="flag-dot" /> 学習用の仮定</span>
          </div>

          <div className="workspace-layout">
            <div className="workspace-main">
              <div className="scenario-card">
                <div className="panel-heading">
                  <div><span className="panel-index">01 / SCENARIO</span><h3>起きたこと</h3></div>
                  <span className="panel-note">ひとつ選択</span>
                </div>
                <div className="scenario-options" role="group" aria-label="シミュレーションする状況">
                  {SCENARIO_OPTIONS.map((option) => (
                    <button
                      type="button" key={option.key}
                      className={"scenario-option" + (scenario === option.key ? " selected" : "")}
                      aria-pressed={scenario === option.key}
                      onClick={() => setScenario(option.key)}
                    >
                      <span className="scenario-selection" aria-hidden="true" />
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="scenario-description">{activeScenario.detail}</p>
              </div>

              <div className="atlas-card" aria-labelledby="atlas-title">
                <div className="panel-heading">
                  <div><span className="panel-index">02 / ATLAS</span><h3 id="atlas-title">依存関係</h3></div>
                  <span className="panel-note">ノードを選択</span>
                </div>
                <div className="atlas-visual" role="group" aria-label="架空のアカウントに必要な手段">
                  <svg className="atlas-connectors" viewBox="0 0 800 365" preserveAspectRatio="none" aria-hidden="true">
                    <path className={"route " + (phone === "unreachable" ? "route-blocked" : "route-live")} d="M138 126 C138 232 330 203 400 296" />
                    <path className="route route-unknown" d="M400 115 V296" />
                    <path className={"route " + (proposed ? "route-proposed" : "route-dormant")} d="M661 126 C661 232 470 203 400 296" />
                    <circle cx="400" cy="296" r="3" className="route-end" />
                  </svg>
                  {nodes.map((node) => (
                    <button
                      type="button" key={node.id}
                      className={"atlas-node node-" + node.id + (selectedNode === node.id ? " node-selected" : "") + (node.id === "spare-key" && !proposed ? " node-dormant" : "")}
                      data-state={node.status}
                      aria-pressed={selectedNode === node.id}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <span className="node-topline"><span className="node-eyebrow">{node.eyebrow}</span><StatusMark status={node.status} /></span>
                      <strong>{node.title}</strong>
                      <small>{node.description}</small>
                    </button>
                  ))}
                  <span className="atlas-note">メールを使う復旧には<br />追加の本人確認が必要という仮定</span>
                </div>
                <div className="atlas-footer">
                  <div className="node-detail" aria-live="polite">
                    <span className="detail-kicker">{selected.kind} / 選択中</span>
                    <strong>{selected.title}</strong>
                    <p>{selected.detail}</p>
                  </div>
                  <span className="atlas-count">MODEL {DEMO_MODEL.configurationId}</span>
                </div>
              </div>

              <div className={"proposal-card" + (proposed ? " is-proposed" : "")}>
                <div className="proposal-icon" aria-hidden="true">+</div>
                <div className="proposal-content">
                  <span className="panel-index">03 / WHAT IF</span>
                  <h3>独立した予備キーがあったら</h3>
                  <p>端末とは別の場所に保管したキーを、追加のログイン手段として仮定します。</p>
                  {proposed && <span className="hypothetical-note">仮の変更 · 実際のサービスには登録されていません</span>}
                </div>
                <button type="button" className="proposal-toggle" role="switch" aria-checked={proposed}
                  aria-label="予備キーを仮に追加する"
                  onClick={() => { setProposed((value) => !value); setSelectedNode("spare-key"); }}>
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                  <span>{proposed ? "比較中" : "追加を試す"}</span>
                </button>
              </div>
            </div>

            <aside className="results-card" aria-labelledby="results-title">
              <div className="results-heading">
                <span className="panel-index">EVALUATION / 01</span>
                <h3 id="results-title">この状況で</h3>
                <span className="results-context">{activeScenario.label} · {proposed ? "仮の構成" : "元の構成"}</span>
              </div>
              <div className="primary-result" aria-live="polite" aria-atomic="true">
                <span className="result-subtitle">通常のログイン</span>
                <div className="result-heading"><StatusMark status={login.status} /><strong>{ownerWord(login.status)}</strong></div>
                <p>{login.status === "reachable"
                  ? "この構成で想定したログイン経路が残っています。"
                  : login.status === "unreachable"
                  ? "想定したログイン手段にアクセスできません。"
                  : "利用できるログイン経路があるか、条件を確認する必要があります。"}</p>
                {changed && <span className="comparison-delta">元の構成：{ownerWord(beforeLogin)} → 仮の構成：{ownerWord(login.status)}</span>}
              </div>
              <div className="result-line">
                <div><span>アカウントの復旧</span><strong>{ownerWord(recovery.status)}</strong></div>
                <StatusMark status={recovery.status} />
              </div>
              <div className="result-line">
                <div><span>第三者による乗っ取り</span><strong>{attackerWord(takeover.status)}</strong></div>
                <StatusMark status={takeover.status} />
              </div>
              <div className="explanation">
                <span className="panel-index">なぜこの結果に？</span>
                <p>{scenario === "lostPhone"
                  ? proposed
                    ? "スマートフォンからは使えませんが、別の場所の予備キーを使えるという仮定ではログイン経路が残ります。"
                    : "通常ログインはスマートフォンだけに依存しています。端末を失うと、その経路も使えなくなります。"
                  : scenario === "lostMailbox"
                    ? "メールを利用できないため、メールを必要とする復旧経路は成立しません。端末からのログインは別です。"
                  : scenario === "compromisedMailbox"
                    ? "メールを第三者が使えるとしても、追加の本人確認が不明なため、乗っ取りの成立は断定できません。"
                    : "既知のログイン手段は使える想定です。ただし、復旧時に必要な追加確認の条件は不明です。"}</p>
              </div>
              <div className="next-step">
                <span className="panel-index">次に確認すること</span>
                <strong>{scenario === "lostMailbox" ? "メール以外の復旧経路" : scenario === "compromisedMailbox" ? "メールに依存する変更・復旧手続き" : "端末から独立した認証手段"}</strong>
                <p>実際に利用するサービスの公式設定と復旧手順で、使える方法を確認してください。</p>
              </div>
            </aside>
          </div>

          <div className="evidence-strip" aria-label="このシミュレーションの制約">
            <span><span className="evidence-point" /> 使用しているのは架空の構成です</span>
            <span>追加の本人確認：{ownerWord(check)}</span>
            <span>設定変更：{proposed ? "シミュレーションのみ" : "なし"}</span>
          </div>
        </section>

        <section className="method-section" id="approach">
          <div><span className="eyebrow">HOW IT WORKS</span><h2>経路を分けて考える。</h2></div>
          <div className="method-grid">
            <div className="method-item"><span>01</span><h3>使えるか</h3><p>ログイン・復旧・設定変更を別の条件としてたどります。</p></div>
            <div className="method-item"><span>02</span><h3>どこに依存するか</h3><p>ひとつの端末やメールに集中した経路を確認します。</p></div>
            <div className="method-item"><span>03</span><h3>何が未確認か</h3><p>資料や実際の設定で確かめていない条件は、不明として残します。</p></div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span><SecuritySymbol /> Security Twin</span>
        <p>Security Twinは認証情報の保管先ではありません。実際の復旧コードやパスワードを入力しないでください。</p>
        <span>EARLY PREVIEW · 2026</span>
      </footer>
    </div>
  );
}
