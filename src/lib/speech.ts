"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 語音輸入（票 05）—— 瀏覽器原生 Web Speech API。
 *
 * - `zh-HK`（粵語）優先；若瀏覽器報 `language-not-supported`，自動回落 `zh-CN`。
 * - 支援度：Chrome / Edge 佳；Safari / Firefox 多不支援 → `supported` 為 false，UI 需提示手打。
 * - **接縫**：對外只暴露 start/stop，日後要換雲端 ASR（Whisper / 訊飛），改此檔即可，UI 不動。
 * - ⚠️ 本檔**不含任何面向使用者的文案**：錯誤以**代號**回傳，由 UI 查 `messages.voice`。
 *
 * 隱私：Web Speech 由瀏覽器／作業系統的語音服務辨識（Chrome 會將音訊上傳至 Google），
 * 並非本地處理 —— UI 需如實告知使用者。
 */

type RecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type RecognitionEventLike = {
  resultIndex: number;
  results: { length: number } & Record<number, RecognitionResultLike>;
};

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => RecognitionLike;

/** 錯誤代號 —— 對應 `messages.voice` 的鍵。 */
export type SpeechErrorKey = "unsupported" | "notAllowed" | "noSpeech" | "error" | "startFail";

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  error: SpeechErrorKey | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * @param onText 每段辨識文字回呼（interim 與 final 都會呼叫；final 段落已定稿）
 */
export function useSpeechInput(onText: (text: string, isFinal: boolean) => void): SpeechInput {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechErrorKey | null>(null);
  const recRef = useRef<RecognitionLike | null>(null);
  const langRef = useRef<string>("zh-HK");
  const retriedRef = useRef(false);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => recRef.current?.abort();
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("unsupported");
      return;
    }
    setError(null);
    retriedRef.current = false;

    const rec = new Ctor();
    rec.lang = langRef.current;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let text = "";
      let isFinal = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        text += r[0].transcript;
        if (r.isFinal) isFinal = true;
      }
      if (text) onTextRef.current(text, isFinal);
    };

    rec.onerror = (e) => {
      // 粵語不被支援時回落一次國語
      if (e.error === "language-not-supported" && !retriedRef.current) {
        retriedRef.current = true;
        langRef.current = "zh-CN";
        recRef.current?.abort();
        start();
        return;
      }
      setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "notAllowed" : e.error === "no-speech" ? "noSpeech" : "error");
      setListening(false);
    };

    rec.onend = () => setListening(false);

    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setError("startFail");
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, error, start, stop, toggle };
}
