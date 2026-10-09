"use client";

import { useState } from "react";
import { MicButton } from "./MicButton";
import { useI18n } from "@/components/i18n/LocaleProvider";

/**
 * 輸入列（麥克風 + 輸入框 + 送出）。手機與桌面兩個版面共用，只有尺寸不同。
 * 草稿狀態由本元件持有；送出後清空。
 */
export function Composer({
  onSend,
  onNotice,
  disabled,
  size = "md",
}: {
  onSend: (text: string) => void;
  onNotice: (msg: string) => void;
  disabled?: boolean;
  size?: "md" | "sm";
}) {
  const { m } = useI18n();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const inputCls = size === "sm" ? "h-9 px-3" : "h-10 px-4";
  const sendCls = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className={`flex items-center gap-2 ${size === "sm" ? "p-3" : "px-3 py-2"}`}>
      <MicButton
        size={size === "sm" ? "sm" : "md"}
        disabled={disabled}
        onInterim={setDraft}
        onFinal={(t) => {
          onSend(t);
          setDraft("");
        }}
        onNotice={onNotice}
      />
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={m.composer.placeholder}
        className={`${inputCls} flex-1 rounded-full bg-slate-100 text-sm outline-none`}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !draft.trim()}
        aria-label={m.composer.send}
        className={`flex ${sendCls} flex-none items-center justify-center rounded-full bg-teal-600 text-white transition disabled:opacity-40`}
      >
        ↑
      </button>
    </div>
  );
}
