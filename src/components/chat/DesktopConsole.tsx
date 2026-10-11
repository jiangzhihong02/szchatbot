"use client";

import { useEffect, useRef } from "react";
import { useChat } from "./useChat";
import { CardView } from "./cards";
import { PresetBar } from "./PresetBar";
import { TravellersPicker } from "./TravellersPicker";
import { Composer } from "./Composer";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { EmptyState, Icon, Card, CardSkeleton } from "@/components/ui";

/** 桌面版：分欄指令台（票 02 的 verdict）。左為動作與對話，右為大卡片舞台。 */
export function DesktopConsole() {
  const { m } = useI18n();
  const { messages, busy, awaitingTravellers, send, sendIntent, chooseTravellers, cycleRoute, postNotice } = useChat();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const stagedCards = [...messages].reverse().find((msg) => (msg.cards?.length ?? 0) > 0);
  const pending = messages.find((msg) => msg.id === awaitingTravellers);

  return (
    <div className="flex h-screen bg-bg">
      <aside className="flex w-80 flex-none flex-col border-r border-line bg-surface lg:w-[22rem]">
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="flex-1 truncate font-semibold tracking-tight text-ink">{m.brand}</span>
          <LocaleSwitcher />
        </header>

        <div className="border-b border-line px-3 py-3">
          <PresetBar layout="grid" onPick={sendIntent} disabled={busy} />
        </div>

        <div ref={logRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary-weak px-3 py-2 text-xs text-ink">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="max-w-[92%] space-y-1">
                  {msg.text || msg.streaming ? (
                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-ink">
                      {msg.text}
                      {msg.streaming && <span className="ml-0.5 animate-pulse text-ink-3">▍</span>}
                    </div>
                  ) : null}
                  {msg.cards && msg.cards.length > 0 && (
                    <p className="px-0.5 text-2xs text-ink-3">→ {m.desktop.shownRight}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-line">
          <Composer size="sm" onSend={send} onNotice={postNotice} disabled={busy} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {pending && <TravellersPicker onPick={(t) => chooseTravellers(pending.id, t)} />}
          {stagedCards ? (
            stagedCards.cards!.map((c, i) => <CardView key={i} card={c} onCycleRoute={() => cycleRoute(stagedCards)} />)
          ) : pending ? null : busy ? (
            <Card className="p-4">
              <CardSkeleton />
            </Card>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-line">
              <EmptyState icon={<Icon name="pin" size={24} />} title={m.desktop.empty} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
