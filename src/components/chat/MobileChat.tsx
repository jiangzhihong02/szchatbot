"use client";

import { useEffect, useRef } from "react";
import { useChat } from "./useChat";
import { CardView } from "./cards";
import { PresetBar } from "./PresetBar";
import { TravellersPicker } from "./TravellersPicker";
import { Composer } from "./Composer";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Surface, CardSkeleton } from "@/components/ui";

/** 手機版：對話優先（票 02 的 verdict）。 */
export function MobileChat() {
  const { m } = useI18n();
  const { messages, busy, awaitingTravellers, send, sendIntent, chooseTravellers, cycleRoute, postNotice } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-bg">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="flex-1">
          <p className="text-sm font-semibold tracking-tight text-ink">{m.brand}</p>
          <p className="text-2xs text-ink-3">{m.tagline}</p>
        </div>
        <LocaleSwitcher />
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary-weak px-4 py-2.5 text-sm text-ink">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div className="max-w-[94%] space-y-2.5">
                {msg.text || msg.streaming ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {msg.text}
                    {msg.streaming && <span className="ml-0.5 animate-pulse text-ink-3">▍</span>}
                  </div>
                ) : null}
                {msg.cards && msg.cards.length > 0 ? (
                  msg.cards.map((c, i) => <CardView key={i} card={c} onCycleRoute={() => cycleRoute(msg)} />)
                ) : !msg.text && !msg.streaming && awaitingTravellers !== msg.id ? (
                  <Surface className="p-4">
                    <CardSkeleton />
                  </Surface>
                ) : null}
                {awaitingTravellers === msg.id && (
                  <TravellersPicker onPick={(t) => chooseTravellers(msg.id, t)} />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <div className="border-t border-line bg-surface">
        <div className="pt-2">
          <PresetBar onPick={sendIntent} disabled={busy} />
        </div>
        <Composer onSend={send} onNotice={postNotice} disabled={busy} />
      </div>
    </div>
  );
}
