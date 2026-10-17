import type { DemoScenarioKey } from "./demo.ts";
import type { Status } from "./engine.ts";

/** Words for owner capabilities. Not a security score. */
export function ownerLabel(status: Status): string {
  if (status === "reachable") return "利用できる";
  if (status === "unreachable") return "利用できない";
  return "判断できない";
}

function attackerLabel(status: Status): string {
  if (status === "reachable") return "想定した経路が成立";
  if (status === "unreachable") return "想定した経路は不成立";
  return "成立するか不明";
}

export interface CascadeInput {
  scenario: DemoScenarioKey;
  login: Status;
  recovery: Status;
  takeover: Status;
}

/** Ordered consequences of one assumption. Each line is a separate claim. */
export function cascadeLines(input: CascadeInput): string[] {
  const situation = input.scenario === "lostPhone"
    ? "スマートフォンにアクセスできないと仮定します。"
    : input.scenario === "lostMailbox"
      ? "メインメールを利用できないと仮定します。"
      : input.scenario === "compromisedMailbox"
        ? "第三者がメインメールを操作できると仮定します。所有者の利用可否とは別です。"
        : "既知の手段が使えると仮定します。";
  return [
    situation,
    `通常のログインは${ownerLabel(input.login)}。`,
    `アカウントの復旧は${ownerLabel(input.recovery)}。ログインできることとは別です。`,
    `第三者の乗っ取りは${attackerLabel(input.takeover)}。`,
  ];
}

export interface PlayStep {
  title: string;
  detail: string;
}

/** Unperformed checks in the real service. Never a claim that they were done. */
export function playbook(scenario: DemoScenarioKey): PlayStep[] {
  if (scenario === "lostMailbox") {
    return [
      { title: "公式の復旧手順を見る", detail: "メインメールが必須かを、そのサービスの説明で確認します。この画面は手順を開きません。" },
      { title: "ログインと復旧を分ける", detail: "端末からログインできても、メールを使う復旧ができることにはなりません。" },
      { title: "確認は未実施のまま", detail: "ここで選んだ前提は、復旧テストが済んだことにはなりません。" },
    ];
  }
  if (scenario === "compromisedMailbox") {
    return [
      { title: "メールだけで進む変更を見る", detail: "パスワード変更や復旧が、そのメールだけで完了しないかを公式手順で確認します。" },
      { title: "乗っ取りは断定しない", detail: "追加の本人確認が不明なら、第三者が入れるとは言いません。" },
      { title: "変更はこの画面の外", detail: "実際の設定変更は公式の画面で行います。ここは未実施の計画だけです。" },
    ];
  }
  if (scenario === "normal") {
    return [
      { title: "ログインと復旧を分ける", detail: "普段入れることと、端末やメールを失って戻れることは別です。" },
      { title: "不明な確認を残す", detail: "追加の本人確認の中身が不明なら、復旧も乗っ取りも判断できません。" },
      { title: "次の確認は未実施", detail: "公式設定を見るまでは、改善したことにはしません。" },
    ];
  }
  return [
    { title: "端末と独立した手段を見る", detail: "公式の設定で、このスマートフォンがなくても入れる方法があるかを確認します。" },
    { title: "同じ失敗先を分ける", detail: "その手段が同じ端末や同じメールだけに依存していないかを見ます。" },
    { title: "登録は未実施", detail: "この画面の仮定は、キーを登録したことも動作確認でもありません。" },
  ];
}
