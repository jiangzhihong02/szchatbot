"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";
import { CardView } from "./cards";
import { PresetBar, HeadcountPicker, MicButton } from "./parts";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocaleProvider";

/** 桌面版：分欄指令台（票 02 的 verdict）。左為動作與對話，右為大卡片舞台。 */
export function DesktopConsole() {
  const { m } = useI18n();
  const { messages, busy, awaitingHeadcount, send, sendIntent, chooseHeadcount, cycleRoute, note } = useChat();
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

  const staged = [...messages].reverse().find((msg) => (msg.cards?.length ?? 0) > 0);
  const pending = messages.find((msg) => msg.id === awaitingHeadcount);

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="flex w-[22rem] flex-none flex-col border-r border-slate-200 bg-white">
        <header className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          <span className="text-xl">🌆</span>
          <span className="flex-1 truncate font-semibold text-slate-900">{m.brand}</span>
          <LocaleSwitcher />
        </header>

        <div className="border-b border-slate-100 px-3 py-3">
          <PresetBar layout="grid" onPick={sendIntent} disabled={busy} />
        </div>

        <div ref={logRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-600 px-3 py-2 text-xs text-white">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-1">
                  {msg.text || msg.streaming ? (
                    <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-900/5">
                      {msg.text}
                      {msg.streaming && <span className="ml-0.5 animate-pulse">▍</span>}
                    </div>
                  ) : null}
                  {msg.cards && msg.cards.length > 0 && (
                    <p className="px-1 text-[11px] text-slate-400">→ {m.desktop.shownRight}</p>
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
            placeholder={m.composer.placeholder}
            className="h-9 flex-1 rounded-full bg-slate-100 px-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label={m.composer.send}
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
            staged.cards!.map((c, i) => <CardView key={i} card={c} onCycleRoute={() => cycleRoute(staged)} />)
          ) : (
            !pending && (
              <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 px-6 text-center text-sm text-slate-400">
                <div>
                  <p className="text-4xl">👈</p>
                  <p className="mt-2">{m.desktop.empty}</p>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
