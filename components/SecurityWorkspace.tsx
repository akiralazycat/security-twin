"use client";

import { useMemo, useState } from "react";
import {
  evaluateDemo, reportStatus,
  type DemoScenarioKey,
} from "../src/demo";
import type { CapabilityResult, Status } from "../src/engine";
import { INITIAL_SESSION_ANSWERS, evaluateSession, type SessionAnswers, type StatedAvailability } from "../src/profile";

type NodeId = "phone" | "mailbox" | "spare-key" | "alternate-recovery" | "extra-check" | "account";
type WorkspaceMode = "example" | "session";

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
    title: "別のログイン手段", kind: "前提または仮の変更",
    detail: "メイン端末とは独立して使えるという前提です。対象サービスでの登録や利用可能性は確認していません。",
  },
  "alternate-recovery": {
    title: "メール以外の復旧経路", kind: "自己申告の前提",
    detail: "メールに依存しない復旧方法があるという自己申告の前提です。実際に復旧できることや独立性は検証していません。",
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
  const [mode, setMode] = useState<WorkspaceMode>("example");
  const [answers, setAnswers] = useState<SessionAnswers>({ ...INITIAL_SESSION_ANSWERS });
  const [scenario, setScenario] = useState<DemoScenarioKey>("lostPhone");
  const [proposed, setProposed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeId>("phone");

  const results = useMemo(
    () => mode === "example" ? evaluateDemo(scenario, proposed) : evaluateSession(answers, scenario, proposed),
    [mode, answers, scenario, proposed]
  );
  const sessionMode = mode === "session";
  const setModeSafely = (next: WorkspaceMode) => {
    setMode(next);
    setSelectedNode("phone");
    setProposed(false);
  };
  const setAnswer = (key: keyof SessionAnswers, value: StatedAvailability) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setSelectedNode("phone");
    setProposed(false);
  };
  const resetAnswers = () => {
    setAnswers({ ...INITIAL_SESSION_ANSWERS });
    setSelectedNode("phone");
    setProposed(false);
  };
  const displayed = results.displayed;
  const login = findResult(displayed.capabilities, "account-login");
  const recovery = findResult(displayed.capabilities, "account-recovery");
  const takeover = findResult(displayed.capabilities, "account-takeover");
  const beforeLogin = reportStatus(results.baseline, "account-login");
  const phone = requirementStatus(displayed.capabilities, "phone");
  const mailbox = requirementStatus(displayed.capabilities, "mailbox");
  const baselineOtherLogin = sessionMode && answers.otherLogin !== "no"
    ? requirementStatus(displayed.capabilities, "spare-key") : "unknown";
  const spare = proposed
    ? requirementStatus(displayed.capabilities, sessionMode ? "hypothetical-key" : "spare-key")
    : baselineOtherLogin;
  const alternateRecovery = sessionMode && answers.otherRecovery !== "no"
    ? requirementStatus(displayed.capabilities, "alternate-recovery") : "unknown";
  const check = requirementStatus(displayed.capabilities, "extra-check");
  const changed = beforeLogin !== login.status;
  const activeScenario = SCENARIO_OPTIONS.find((option) => option.key === scenario)!;
  const selected = LABELS[selectedNode];
  const selectedDetail = selectedNode === "spare-key" && proposed
    ? "仮に独立したキーを追加した場合の計算です。実際の登録・動作確認を意味しません。"
    : selectedNode === "account" && sessionMode
      ? "選択した回答を前提にした抽象モデルです。どのサービスで実際に使えるかは検証していません。"
      : selected.detail;
  const selectedTitle = selectedNode === "account" && sessionMode ? "モデル上のアカウント" : selected.title;

  const nodes: { id: NodeId; title: string; eyebrow: string; status: Status; description: string }[] = [
    { id: "phone", title: "スマートフォン", eyebrow: "ログイン手段", status: phone, description: ownerWord(phone) },
    { id: "mailbox", title: "メインメール", eyebrow: "復旧先", status: mailbox, description: scenario === "compromisedMailbox" ? "侵害を想定" : ownerWord(mailbox) },
    { id: "spare-key", title: sessionMode && !proposed ? "別のログイン方法" : "予備キー", eyebrow: proposed ? "仮の変更" : "別の経路", status: spare,
      description: proposed ? "仮に追加" : sessionMode ? answers.otherLogin === "yes" ? "自己申告：ある" : answers.otherLogin === "unknown" ? "条件が不明" : "申告なし" : "未追加" },
    { id: "account", title: sessionMode ? "モデル上のアカウント" : "架空のアカウント", eyebrow: "通常ログイン", status: login.status, description: ownerWord(login.status) },
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
        <span className="header-edition">PREVIEW · {sessionMode ? "一時的な構成" : "架空の構成"}</span>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-text">
            <span className="eyebrow"><span className="eyebrow-line" /> SECURITY ATLAS / 01</span>
            <h1>もし、スマートフォンを<br className="desktop-break" />失ったら。</h1>
            <p className="intro-lead">いつものログインが使えなくなったとき、ほかにどんな経路が残るのか。端末・メール・認証手段のつながりを変えながら、確かめられます。</p>
            <div className="intro-actions">
              <a className="primary-link" href="#workspace">経路を試す <MiniArrow /></a>
              <span>登録不要 · サンプルまたは匿名の構成を試せます</span>
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
              <p>{sessionMode ? "個人名やサービス名を使わず、選んだ前提だけで経路を確かめます。" : "ひとつの架空の構成で、状況を変えてみます。各ノードを選ぶと、役割を確認できます。"}</p>
            </div>
            <span className="sample-flag"><span className="flag-dot" /> {sessionMode ? "未検証の自己申告" : "学習用の仮定"}</span>
          </div>

          <div className="profile-mode-card" aria-label="構成の種類">
            <div className="profile-mode-top">
              <div className="mode-options" role="group" aria-label="構成を選ぶ">
                <button type="button" aria-pressed={!sessionMode} className={!sessionMode ? "is-current" : ""}
                  onClick={() => setModeSafely("example")}>架空の例</button>
                <button type="button" aria-pressed={sessionMode} className={sessionMode ? "is-current" : ""}
                  onClick={() => setModeSafely("session")}>自分の状況を試す</button>
              </div>
              <span className="mode-memory">{sessionMode ? "このタブ内のみ · 再読み込みで消えます" : "モデルを切り替えて比較できます"}</span>
            </div>
            {sessionMode && <div className="session-editor">
              <div className="session-editor-intro">
                <div>
                  <span className="panel-index">YOUR ASSUMPTIONS / 2 QUESTIONS</span>
                  <h3>今の構成に近づける</h3>
                  <p>選んだ条件をこの画面で計算します。設定の確認や実際の復旧テストは行いません。</p>
                </div>
                <button type="button" className="session-reset" onClick={resetAnswers}>選択をリセット</button>
              </div>
              {([
                { key: "otherLogin", label: "スマートフォン以外からログインできる経路はありますか？", note: "その端末を失っても使える、独立した方法を想定" },
                { key: "otherRecovery", label: "メインメールを失っても使える復旧経路はありますか？", note: "別のメールや認証方法など、メインメールに依存しない経路を想定" },
              ] as const).map((question) => (
                <div className="session-question" key={question.key}>
                  <div className="session-question-heading">
                    <strong>{question.label}</strong>
                    <span>{question.note}</span>
                  </div>
                  <div className="session-answer-options" role="group" aria-label={question.label}>
                    {([
                      { value: "yes", label: "ある" }, { value: "no", label: "ない" }, { value: "unknown", label: "わからない" },
                    ] as const).map((answer) => (
                      <button key={answer.value} type="button" aria-pressed={answers[question.key] === answer.value}
                        className={answers[question.key] === answer.value ? "is-current" : ""}
                        onClick={() => setAnswer(question.key, answer.value)}>{answer.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="session-privacy">入力欄は設けていません。選択はサーバーへ送信・保存されず、画面を再読み込みすると消えます。ブラウザー内の一時状態であり、暗号化された保管庫ではありません。</p>
            </div>}
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
                <div className="atlas-visual" role="group" aria-label="モデル上のアカウントに必要な主な経路">
                  <svg className="atlas-connectors" viewBox="0 0 800 365" preserveAspectRatio="none" aria-hidden="true">
                    <path className={"route " + (phone === "unreachable" ? "route-blocked" : "route-live")} d="M138 126 C138 232 330 203 400 296" />
                    <path className="route route-unknown" d="M400 115 V296" />
                    <path className={"route " + ((proposed || (sessionMode && answers.otherLogin !== "no")) ? (spare === "unreachable" ? "route-blocked" : spare === "unknown" ? "route-unknown" : "route-proposed") : "route-dormant")} d="M661 126 C661 232 470 203 400 296" />
                    {sessionMode && answers.otherRecovery !== "no" && <path className={"route " + (alternateRecovery === "reachable" ? "route-proposed" : "route-unknown")} d="M155 303 L290 303" />}
                    <circle cx="400" cy="296" r="3" className="route-end" />
                  </svg>
                  {nodes.map((node) => (
                    <button
                      type="button" key={node.id}
                      className={"atlas-node node-" + node.id + (selectedNode === node.id ? " node-selected" : "") + (node.id === "spare-key" && !proposed && (!sessionMode || answers.otherLogin === "no") ? " node-dormant" : "")}
                      data-state={node.status}
                      aria-pressed={selectedNode === node.id}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <span className="node-topline"><span className="node-eyebrow">{node.eyebrow}</span><StatusMark status={node.status} /></span>
                      <strong>{node.title}</strong>
                      <small>{node.description}</small>
                    </button>
                  ))}
                  {sessionMode && answers.otherRecovery !== "no" ?
                    <button type="button" className={"atlas-node node-alt-recovery" + (selectedNode === "alternate-recovery" ? " node-selected" : "")}
                      aria-pressed={selectedNode === "alternate-recovery"} data-state={alternateRecovery}
                      onClick={() => setSelectedNode("alternate-recovery")}>
                      <span className="node-topline"><span className="node-eyebrow">復旧の別経路</span><StatusMark status={alternateRecovery}/></span>
                      <strong>メール以外の復旧</strong><small>{answers.otherRecovery === "yes" ? "自己申告：ある" : "条件が不明"}</small>
                    </button> :
                    <span className="atlas-note">メールを使う復旧には<br />追加の本人確認が必要という仮定</span>}
                </div>
                <div className="atlas-path-list" role="list" aria-label="各認証経路の評価">
                  <div className="path-list-item" role="listitem">
                    <span><StatusMark status={phone} /> 通常ログイン / スマートフォン</span>
                    <strong>{ownerWord(phone)}</strong>
                  </div>
                  {sessionMode && answers.otherLogin !== "no" && <div className="path-list-item" role="listitem">
                    <span><StatusMark status={baselineOtherLogin} /> 通常ログイン / 別の経路（自己申告）</span>
                    <strong>{ownerWord(baselineOtherLogin)}</strong>
                  </div>}
                  {proposed && <div className="path-list-item" role="listitem">
                    <span><StatusMark status={spare} /> 通常ログイン / 新しい予備キー（仮）</span>
                    <strong>{ownerWord(spare)}</strong>
                  </div>}
                  {sessionMode && answers.otherRecovery !== "no" && <div className="path-list-item" role="listitem">
                    <span><StatusMark status={alternateRecovery} /> 復旧 / メール以外の経路（自己申告）</span>
                    <strong>{ownerWord(alternateRecovery)}</strong>
                  </div>}
                  <div className="path-list-item" role="listitem">
                    <span><StatusMark status={recovery.status} /> アカウント復旧 / モデル全体</span>
                    <strong>{ownerWord(recovery.status)}</strong>
                  </div>
                </div>
                <div className="atlas-footer">
                  <div className="node-detail" aria-live="polite">
                    <span className="detail-kicker">{selected.kind} / 選択中</span>
                    <strong>{selectedTitle}</strong>
                    <p>{selectedDetail}</p>
                  </div>
                  <span className="atlas-count">MODEL {results.baseline.configurationId}</span>
                </div>
              </div>

              <div className={"proposal-card" + (proposed ? " is-proposed" : "")}>
                <div className="proposal-icon" aria-hidden="true">+</div>
                <div className="proposal-content">
                  <span className="panel-index">03 / WHAT IF</span>
                  <h3>別の予備キーを追加できたら</h3>
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
                <span className="results-context">{activeScenario.label} · {proposed ? "追加を仮定" : sessionMode ? "自己申告の前提" : "元の構成"}</span>
              </div>
              <div className="primary-result" aria-live="polite" aria-atomic="true">
                <span className="result-subtitle">通常のログイン · {sessionMode ? "モデル上の結果" : "架空の例"}</span>
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
                <span className={"status-mark attack-status attack-" + takeover.status} aria-hidden="true" />
              </div>
              <div className="explanation">
                <span className="panel-index">なぜこの結果に？</span>
                <p>{sessionMode
                  ? scenario === "lostPhone"
                    ? login.status === "reachable"
                      ? "端末とは別の経路が残ると仮定しています。実際のサービスに登録済みか、独立して使えるかは未検証です。"
                      : login.status === "unknown"
                        ? "端末以外の経路が使えるか不明なため、ログイン可否は判断できません。"
                        : "申告した経路では、端末を失うと通常ログインできません。ほかの復旧手段は別に確認が必要です。"
                    : scenario === "lostMailbox"
                      ? recovery.status === "reachable"
                        ? "メール以外の復旧経路が使えるという自己申告を前提にしています。実際の復旧成功は未検証です。"
                        : recovery.status === "unknown"
                          ? "メインメール以外の復旧方法が使えるか不明です。"
                          : "申告した構成では、メインメールに依存する復旧経路が使えなくなります。"
                      : scenario === "compromisedMailbox"
                        ? "メールが侵害されても、追加の本人確認条件が不明なため、第三者の乗っ取りは断定できません。"
                        : "選択した方法を使えるという条件付きの計算です。実際のサービス設定は確認していません。"
                  : scenario === "lostPhone"
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
            <span><span className="evidence-point" /> {sessionMode ? "自己申告した前提は未検証です" : "使用しているのは架空の構成です"}</span>
            <span>追加の本人確認：{ownerWord(check)}</span>
            <span>設定変更：{proposed ? "シミュレーションのみ" : "なし"} · 保存：なし</span>
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
