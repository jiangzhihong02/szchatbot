"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";
import { CardView } from "./cards";
import { PresetBar, HeadcountPicker, MicButton } from "./parts";

/** 手機版：對話優先（票 02 的 verdict）。 */
export function MobileChat() {
  const { messages, busy, awaitingHeadcount, send, sendIntent, chooseHeadcount, cycleRoute, note } =
    useChat();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const submit = () => {
    if (!draft.trim()) return;
    send(draft);
    setDraft("");
  };

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-slate-50">
      <header className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-white">
        <span className="text-2xl">🌆</span>
        <div>
          <p className="text-sm font-semibold">深圳旅遊助手</p>
          <p className="text-[11px] opacity-85">為香港旅客而設 · 繁體</p>
        </div>
      </header>

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id}>
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-teal-600 px-4 py-2.5 text-sm text-white">
                  {m.text}
                </div>
              </div>
            ) : (
              <div className="max-w-[92%] space-y-2">
                {m.text || m.streaming ? (
                  <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                    {m.text}
                    {m.streaming && <span className="ml-0.5 animate-pulse">▍</span>}
                  </div>
                ) : null}
                {m.cards?.map((c, i) => (
                  <CardView key={i} card={c} onCycleRoute={() => cycleRoute(m)} />
                ))}
                {awaitingHeadcount === m.id && (
                  <HeadcountPicker onPick={(t) => chooseHeadcount(m.id, t)} />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <div className="border-t border-slate-200 bg-white/85 backdrop-blur">
        <div className="pt-2">
          <PresetBar onPick={sendIntent} disabled={busy} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <MicButton
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
            placeholder="打訊息，或㩒上面嘅掣…"
            className="h-10 flex-1 rounded-full bg-slate-100 px-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-teal-600 text-white transition disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
