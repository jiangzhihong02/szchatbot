"use client";

import { useRef, useState } from "react";
import type { Travellers } from "@/lib/types";
import type { IntentKey } from "@/lib/intents";
import type { DispatchResult } from "@/lib/dispatch-contract";
import { transcriptFor, nextRouteIndex } from "@/lib/conversation";
import type { ChatMsg } from "@/lib/conversation";
import { useI18n } from "@/components/i18n/LocaleProvider";

/**
 * 聊天狀態（兩種版面共用）—— 這是**副作用外殼**：fetch、SSE、React state。
 * 順序敏感與可測的規則（餵給 LLM 的 transcript、換一條的索引）在 `lib/conversation`（純）。
 *
 * 流程：先打 /api/dispatch 走確定性路徑；未命中才打 /api/chat 串流問 LLM。
 * **意圖分發**不回傳文案（只有結構化卡片），故切語言時已顯示的卡片會即時跟著變； * 只有 LLM 的**自由問答**需要把 locale 送給伺服器（決定回答語言）。
 */

export type { ChatMsg };

const uid = () => Math.random().toString(36).slice(2);

async function callDispatch(body: unknown): Promise<DispatchResult> {
  const res = await fetch("/api/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`dispatch ${res.status}`);
  return (await res.json()) as DispatchResult;
}

/** 讀 /api/chat 的 SSE，逐段回呼。locale 決定 LLM 用哪種語言回答。 */
async function streamChat(
  messages: { role: string; content: string }[],
  locale: string,
  onDelta: (s: string) => void
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, locale }),
  });
  if (!res.body) {
    onDelta("（暫時連接不上服務）");
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const l = line.trim();
      if (!l.startsWith("data:")) continue;
      const payload = l.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const j = JSON.parse(payload) as { text?: string; error?: string };
        if (j.text) onDelta(j.text);
        else if (j.error) onDelta(`\n\n${j.error}`);
      } catch {
        /* 忽略不完整片段 */
      }
    }
  }
}

export function useChat() {
  const { m, locale } = useI18n();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uid(), role: "assistant", text: m.greeting },
  ]);
  const [busy, setBusy] = useState(false);
  const [awaitingTravellers, setAwaitingTravellers] = useState<string | null>(null);
  const msgsRef = useRef(messages);
  msgsRef.current = messages;

  const append = (msg: ChatMsg) => setMessages((prev) => [...prev, msg]);
  const replace = (id: string, next: Partial<ChatMsg>) =>
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...next } : msg)));

  /**
   * **意圖分發**結果 → 訊息狀態。按鈕與手打**共用這一處轉換** ——
   * 「缺出行組合就彈快捷選項」只在這裡表述一次。
   */
  function applyResult(id: string, r: DispatchResult) {
    if (!r.matched) return;
    if (r.needsInput === "travellers") {
      replace(id, { cards: undefined, text: m.travellers.prompt });
      setAwaitingTravellers(id);
    } else {
      replace(id, { cards: r.cards, fromIntent: r.intent, routeIndex: 0 });
    }
  }

  /** 按鈕意圖 → 卡片。 */
  async function showIntent(intent: IntentKey, opts: { travellers?: Travellers; routeIndex?: number } = {}) {
    const id = uid();
    append({ id, role: "assistant", cards: [], fromIntent: intent, routeIndex: opts.routeIndex ?? 0 });
    applyResult(id, await callDispatch({ intent, ...opts }));
  }

  async function sendIntent(intent: IntentKey) {
    if (busy) return;
    setBusy(true);
    append({ id: uid(), role: "user", text: m.presets[intent].label });
    try {
      await showIntent(intent);
    } catch {
      append({ id: uid(), role: "assistant", text: m.errors.data });
    } finally {
      setBusy(false);
    }
  }

  async function chooseTravellers(msgId: string, travellers: Travellers) {
    setAwaitingTravellers(null);
    setBusy(true);
    try {
      const r = await callDispatch({ intent: "transportDeals", travellers });
      if (r.matched) replace(msgId, { text: undefined, cards: r.cards });
    } catch {
      replace(msgId, { text: m.errors.calc });
    } finally {
      setBusy(false);
    }
  }

  async function cycleRoute(msg: ChatMsg) {
    if (!msg.fromIntent || busy) return;
    const next = nextRouteIndex(msg.routeIndex);
    setBusy(true);
    try {
      const r = await callDispatch({ intent: msg.fromIntent, routeIndex: next });
      if (r.matched) replace(msg.id, { cards: r.cards, routeIndex: next });
    } finally {
      setBusy(false);
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    // 先記下當前對話文字（不含本則），供未命中時餵 LLM。規則在 lib/conversation。
    const prior = transcriptFor(msgsRef.current);

    setBusy(true);
    append({ id: uid(), role: "user", text });
    try {
      const r = await callDispatch({ text });
      if (r.matched) {
        const id = uid();
        append({ id, role: "assistant", cards: [] });
        applyResult(id, r);
        return;
      }

      // 未命中 → LLM 串流
      const id = uid();
      append({ id, role: "assistant", text: "", streaming: true });
      await streamChat([...prior, { role: "user", content: text }], locale, (delta) =>
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, text: (msg.text ?? "") + delta } : msg)))
      );
      replace(id, { streaming: false });
    } catch {
      append({ id: uid(), role: "assistant", text: m.errors.generic });
    } finally {
      setBusy(false);
    }
  }

  /** 以助手身分插入一則純文字提示（例如語音輸入的出錯 / 隱私說明）。 */
  function postNotice(text: string) {
    append({ id: uid(), role: "assistant", text });
  }

  return { messages, busy, awaitingTravellers, send, sendIntent, chooseTravellers, cycleRoute, postNotice };
}
