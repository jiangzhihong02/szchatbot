// 冒煙檢查：對話的純邏輯（sanitizeTurns / transcriptFor / nextRouteIndex）。
// 執行：npx tsx scripts/check-conversation.ts
//
// sanitizeTurns 本輪從 /api/chat 路由抽出——順序敏感（從首條 user 起、留最近 N 輪），
// 以前埋在路由裡測不到。期望值人手推出。
import { makeChecker } from "./_check";
import { sanitizeTurns, transcriptFor, nextRouteIndex } from "../src/lib/conversation";
import type { ChatMsg } from "../src/lib/conversation";

const { check, report } = makeChecker();
const roles = (ts: { role: string }[]) => ts.map((t) => t.role).join(",");

function main() {
  // ── sanitizeTurns ──
  check("丟掉空白 content", roles(sanitizeTurns([{ role: "user", content: " " }, { role: "user", content: "hi" }])) === "user");
  check("丟掉非 user/assistant 角色", roles(sanitizeTurns([{ role: "system", content: "x" }, { role: "user", content: "hi" }])) === "user");
  check("丟掉開頭的 assistant（首條須 user）", roles(sanitizeTurns([{ role: "assistant", content: "hello" }, { role: "user", content: "hi" }])) === "user");
  check("保留首條 user 之後的 assistant", roles(sanitizeTurns([{ role: "user", content: "a" }, { role: "assistant", content: "b" }])) === "user,assistant");
  check("交錯：丟掉首 user 前所有 assistant", roles(sanitizeTurns([{ role: "assistant", content: "a" }, { role: "assistant", content: "b" }, { role: "user", content: "c" }, { role: "assistant", content: "d" }])) === "user,assistant");
  check("無任何 user → 空陣列", sanitizeTurns([{ role: "assistant", content: "x" }]).length === 0);
  check("非陣列 → 空陣列", sanitizeTurns(undefined).length === 0 && sanitizeTurns("nope").length === 0);
  check("忽略 null / 非物件項", roles(sanitizeTurns([null, { role: "user", content: "hi" }, 5])) === "user");
  check("content 保留原樣（不 trim）", sanitizeTurns([{ role: "user", content: "  hi  " }])[0].content === "  hi  ");

  const three = [{ role: "user", content: "a" }, { role: "user", content: "b" }, { role: "user", content: "c" }];
  check("limit：只留最近 N", roles(sanitizeTurns(three, 2)) === "user,user" && sanitizeTurns(three, 2).map((t) => t.content).join("") === "bc");

  const many = Array.from({ length: 25 }, () => ({ role: "user", content: "x" }));
  check("預設 limit 20", sanitizeTurns(many).length === 20);

  // ── transcriptFor（純；只取有文字的訊息、trim、留最近 limit）──
  const msgs: ChatMsg[] = [
    { id: "1", role: "user", text: "  hi " },
    { id: "2", role: "assistant", cards: [] }, // 純卡片：不計入
    { id: "3", role: "assistant", text: "yo" },
  ];
  const tr = transcriptFor(msgs);
  check("transcriptFor 丟純卡片、trim 文字", tr.length === 2 && tr[0].content === "hi" && tr[1].content === "yo");

  // ── nextRouteIndex ──
  check("nextRouteIndex(undefined)=1", nextRouteIndex(undefined) === 1);
  check("nextRouteIndex(2)=3", nextRouteIndex(2) === 3);

  report();
}

main();
