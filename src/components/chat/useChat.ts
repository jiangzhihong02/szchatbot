"use client";

import { useRef, useState } from "react";
import type { Card, Travellers } from "@/lib/types";
import type { IntentKey } from "@/lib/intents";
import { useI18n } from "@/components/i18n/LocaleProvider";

/**
 * 聊天狀態（兩種版面共用）。
 * 流程：先打 /api/dispatch 走確定性路徑；未命中才打 /api/chat 串流問 LLM。
 */

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  cards?: Card[];
  streaming?: boolean;
  /** 若這則由某意圖產生，記下它以支持「換一條」。 */
  fromIntent?: IntentKey;
  routeIndex?: number;
};

const uid = () => Math.random().toString(36).slice(2);

type DispatchResponse =
  | { matched: false }
  | { matched: true; intent: IntentKey; cards: Card[]; needsInput?: "travellers" };

async function callDispatch(body: unknown): Promise<DispatchResponse> {
  const res = await fetch("/api/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`dispatch ${res.status}`);
  return (await res.json()) as DispatchResponse;
}

/** 讀 /api/chat 的 SSE，逐段回呼。 */
async function streamChat(
  messages: { role: string; content: string }[],
  onDelta: (s: string) => void
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
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
  const { m } = useI18n();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uid(), role: "assistant", text: m.greeting },
  ]);
  const [busy, setBusy] = useState(false);
  const [awaitingHeadcount, setAwaitingHeadcount] = useState<string | null>(null);
  const msgsRef = useRef(messages);
  msgsRef.current = messages;

  const append = (m: ChatMsg) => setMessages((p) => [...p, m]);
  const replace = (id: string, next: Partial<ChatMsg>) =>
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...next } : m)));

  /** 按鈕意圖 → 卡片（pricing 缺人數則彈快捷選項）。 */
  async function showIntent(intent: IntentKey, opts: { travellers?: Travellers; routeIndex?: number } = {}) {
    const id = uid();
    append({ id, role: "assistant", cards: [], fromIntent: intent, routeIndex: opts.routeIndex ?? 0 });
    const r = await callDispatch({ intent, ...opts });
    if (r.matched && r.needsInput === "travellers") {
      replace(id, { cards: undefined, text: m.headcount.prompt });
      setAwaitingHeadcount(id);
    } else if (r.matched) {
      replace(id, { cards: r.cards });
    }
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

  async function chooseHeadcount(msgId: string, travellers: Travellers) {
    setAwaitingHeadcount(null);
    setBusy(true);
    try {
      const r = await callDispatch({ intent: "pricing", travellers });
      if (r.matched) replace(msgId, { text: undefined, cards: r.cards });
    } catch {
      replace(msgId, { text: m.errors.calc });
    } finally {
      setBusy(false);
    }
  }

  async function cycleRoute(msg: ChatMsg) {
    if (!msg.fromIntent || busy) return;
    const next = (msg.routeIndex ?? 0) + 1;
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
    // 先記下當前對話文字（不含本則），供未命中時餵 LLM。
    const prior = msgsRef.current
      .filter((m) => m.text && m.text.trim())
      .map((m) => ({ role: m.role, content: m.text as string }))
      .slice(-12);

    setBusy(true);
    append({ id: uid(), role: "user", text });
    try {
      const r = await callDispatch({ text });
      if (r.matched) {
        if (r.needsInput === "travellers") {
          const id = uid();
          append({ id, role: "assistant", text: m.headcount.prompt, fromIntent: "pricing" });
          setAwaitingHeadcount(id);
        } else {
          append({ id: uid(), role: "assistant", cards: r.cards, fromIntent: r.intent, routeIndex: 0 });
        }
        return;
      }

      // 未命中 → LLM 串流
      const id = uid();
      append({ id, role: "assistant", text: "", streaming: true });
      await streamChat([...prior, { role: "user", content: text }], (delta) =>
        setMessages((p) => p.map((m) => (m.id === id ? { ...m, text: (m.text ?? "") + delta } : m)))
      );
      replace(id, { streaming: false });
    } catch {
      append({ id: uid(), role: "assistant", text: m.errors.generic });
    } finally {
      setBusy(false);
    }
  }

  /** 以助手身分插入一則純文字提示（例如語音輸入的出錯 / 隱私說明）。 */
  function note(text: string) {
    append({ id: uid(), role: "assistant", text });
  }

  return { messages, busy, awaitingHeadcount, send, sendIntent, chooseHeadcount, cycleRoute, note };
}
