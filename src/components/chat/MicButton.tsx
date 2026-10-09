"use client";

import { useEffect, useRef } from "react";
import { useSpeechInput } from "@/lib/speech";
import { useI18n } from "@/components/i18n/LocaleProvider";

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

  const px = size === "sm" ? "h-9 w-9 text-base" : "h-10 w-10 text-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={speech.supported ? m.voice.label : m.voice.unsupported}
      aria-label={speech.listening ? m.voice.stop : m.voice.label}
      className={`flex ${px} flex-none items-center justify-center rounded-full transition disabled:opacity-40 ${
        speech.listening ? "animate-pulse bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      🎤
    </button>
  );
}
