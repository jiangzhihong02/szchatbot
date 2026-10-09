"use client";

import { useEffect, useRef, useState } from "react";
import { PRESET_BUTTONS } from "@/lib/intents";
import type { IntentKey } from "@/lib/intents";
import type { Travellers } from "@/lib/types";
import { useSpeechInput } from "@/lib/speech";

/** 六個預設按鈕（票 01 契約）。 */
export function PresetBar({
  onPick,
  disabled,
  layout = "row",
}: {
  onPick: (key: IntentKey) => void;
  disabled?: boolean;
  layout?: "row" | "grid";
}) {
  const cls =
    layout === "row"
      ? "flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      : "grid grid-cols-2 gap-2";
  return (
    <div className={cls}>
      {PRESET_BUTTONS.map((b) => (
        <button
          key={b.key}
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className={`flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-teal-500 hover:text-teal-700 disabled:opacity-50 ${
            layout === "grid" ? "justify-start rounded-2xl px-3 py-2.5" : "flex-none"
          }`}
        >
          <span className="text-base">{b.emoji}</span>
          <span className="font-medium">{b.label}</span>
        </button>
      ))}
    </div>
  );
}

const QUICK: { label: string; t: Travellers }[] = [
  { label: "1 大人", t: { adults: 1, children: 0 } },
  { label: "2 大人", t: { adults: 2, children: 0 } },
  { label: "2 大 1 小", t: { adults: 2, children: 1 } },
];

/** 人數快捷選項（契約規則 3）。 */
export function HeadcountPicker({ onPick }: { onPick: (t: Travellers) => void }) {
  const [custom, setCustom] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);

  if (custom) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <p className="text-sm font-medium text-slate-900">自訂人數</p>
        <div className="mt-3 flex items-center gap-4">
          <label className="text-sm text-slate-600">
            大人
            <input
              type="number"
              min={0}
              max={50}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1 text-center"
            />
          </label>
          <label className="text-sm text-slate-600">
            小孩
            <input
              type="number"
              min={0}
              max={50}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1 text-center"
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onPick({ adults, children })}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          >
            計算
          </button>
          <button onClick={() => setCustom(false)} className="rounded-xl px-4 py-2 text-sm text-slate-500">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
      <p className="text-sm font-medium text-slate-900">幾位大人？有冇小朋友？</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => onPick(q.t)}
            className="rounded-full border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
          >
            {q.label}
          </button>
        ))}
        <button
          onClick={() => setCustom(true)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-400"
        >
          自訂
        </button>
      </div>
    </div>
  );
}

/**
 * 語音輸入按鈕（票 05）。
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
  const toldRef = useRef(false);
  const lastErrRef = useRef<string | null>(null);

  const speech = useSpeechInput((text, isFinal) => {
    if (isFinal) onFinal(text);
    else onInterim(text);
  });

  // 出錯時以對話訊息提示（去重複）
  useEffect(() => {
    if (speech.error && speech.error !== lastErrRef.current) {
      lastErrRef.current = speech.error;
      onNotice(speech.error);
    }
  }, [speech.error, onNotice]);

  const handleClick = () => {
    if (!speech.supported) {
      onNotice("呢個瀏覽器唔支援語音輸入，直接打字就得（Chrome / Edge 支援最好）。");
      return;
    }
    if (!speech.listening && !toldRef.current) {
      toldRef.current = true;
      onNotice("🎤 語音由瀏覽器嘅語音服務辨識（Chrome 會上傳音訊至 Google），本助手唔會儲存錄音。");
    }
    speech.toggle();
  };

  const px = size === "sm" ? "h-9 w-9 text-base" : "h-10 w-10 text-lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={speech.supported ? "語音輸入" : "此瀏覽器不支援語音輸入"}
      aria-label={speech.listening ? "停止錄音" : "開始語音輸入"}
      className={`flex ${px} flex-none items-center justify-center rounded-full transition disabled:opacity-40 ${
        speech.listening
          ? "animate-pulse bg-red-500 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      🎤
    </button>
  );
}
