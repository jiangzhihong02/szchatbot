"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";
import { CardView } from "./cards";
import { PresetBar, HeadcountPicker, MicButton } from "./parts";

/** 桌面版：分欄指令台（票 02 的 verdict）。左為動作與對話，右為大卡片舞台。 */
export function DesktopConsole() {
  const { messages, busy, awaitingHeadcount, send, sendIntent, chooseHeadcount, cycleRoute, note } =
    useChat();
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!draft.trim()) return;
    send(draft);
    setDraft("");
  };

  // 右側舞台：顯示最近一則帶卡片的回覆。
  const staged = [...messages].reverse().find((m) => (m.cards?.length ?? 0) > 0);
  const pending = messages.find((m) => m.id === awaitingHeadcount);

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="flex w-[22rem] flex-none flex-col border-r border-slate-200 bg-white">
        <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <span className="text-xl">🌆</span>
          <span className="font-semibold text-slate-900">深圳旅遊助手</span>
          <span className="ml-auto rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">
            深圳
          </span>
        </header>

        <div className="border-b border-slate-100 px-3 py-3">
          <PresetBar layout="grid" onPick={sendIntent} disabled={busy} />
        </div>

        <div ref={logRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-600 px-3 py-2 text-xs text-white">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-1">
                  {m.text || m.streaming ? (
                    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-900/5">
                      {m.text}
                      {m.streaming && <span className="ml-0.5 animate-pulse">▍</span>}
                    </div>
                  ) : null}
                  {m.cards && m.cards.length > 0 && (
                    <p className="px-1 text-[11px] text-slate-400">→ 已在右側顯示</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200 p-3">
          <MicButton
            size="sm"
            disabled={busy}
            onInterim={setDraft}
            onFinal={(t) => {
              send(t);
              setDraft("");
            }}
            onNotice={note}
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="打字問…"
            className="h-9 flex-1 rounded-full bg-slate-100 px-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-teal-600 text-white transition disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {pending && <HeadcountPicker onPick={(t) => chooseHeadcount(pending.id, t)} />}
          {staged ? (
            staged.cards!.map((c, i) => (
              <CardView key={i} card={c} onCycleRoute={() => cycleRoute(staged)} />
            ))
          ) : (
            !pending && (
              <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-center text-sm text-slate-400">
                <div>
                  <p className="text-4xl">👈</p>
                  <p className="mt-2">左邊揀一個動作，或直接打字問我</p>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
