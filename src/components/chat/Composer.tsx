"use client";

import { useState } from "react";
import { MicButton } from "./MicButton";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { Input, IconButton, Icon } from "@/components/ui";

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

  const h = size === "sm" ? "h-9" : "h-10";
  const btn = size === "sm" ? "sm" : "md";

  return (
    <div className={`flex items-center gap-2 ${size === "sm" ? "p-3" : "px-3 py-2.5"}`}>
      <MicButton
        size={btn}
        disabled={disabled}
        onInterim={setDraft}
        onFinal={(t) => {
          onSend(t);
          setDraft("");
        }}
        onNotice={onNotice}
      />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={m.composer.placeholder}
        className={`${h} flex-1`}
      />
      <IconButton
        tone="primary"
        size={btn}
        type="button"
        onClick={submit}
        disabled={disabled || !draft.trim()}
        aria-label={m.composer.send}
      >
        <Icon name="send" size={size === "sm" ? 16 : 18} />
      </IconButton>
    </div>
  );
}
