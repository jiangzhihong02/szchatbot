"use client";

import { useEffect, useRef } from "react";
import { useSpeechInput } from "@/lib/speech";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { IconButton, Icon } from "@/components/ui";

/**
 * 語音輸入按鈕（票 05）。文案隨語言。
 * 辨識中的臨時文字 → onInterim（填入輸入框）；定稿 → onFinal（直接送出）。
 * 不支援 / 出錯 / 權限被拒 → onNotice（以對話訊息提示）。
 */
export function MicButton({
  onInterim,
  onFinal,
  onNotice,
  disabled,
  size = "md",
}: {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onNotice: (msg: string) => void;
  disabled?: boolean;
  size?: "md" | "sm";
}) {
  const { m } = useI18n();
  const toldRef = useRef(false);
  const lastErrRef = useRef<string | null>(null);

  const speech = useSpeechInput((text, isFinal) => {
    if (isFinal) onFinal(text);
    else onInterim(text);
  });

  // 錯誤代號 → 當前語言的文案，以對話訊息提示（去重複）
  useEffect(() => {
    if (speech.error && speech.error !== lastErrRef.current) {
      lastErrRef.current = speech.error;
      onNotice(m.voice[speech.error]);
    }
  }, [speech.error, m, onNotice]);

  const handleClick = () => {
    if (!speech.supported) {
      onNotice(m.voice.unsupported);
      return;
    }
    if (!speech.listening && !toldRef.current) {
      toldRef.current = true;
      onNotice(m.voice.privacy);
    }
    speech.toggle();
  };

  return (
    <IconButton
      type="button"
      tone={speech.listening ? "danger" : "neutral"}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      title={speech.supported ? m.voice.label : m.voice.unsupported}
      aria-label={speech.listening ? m.voice.stop : m.voice.label}
      className={speech.listening ? "animate-pulse" : ""}
    >
      <Icon name="mic" size={size === "sm" ? 17 : 19} />
    </IconButton>
  );
}
