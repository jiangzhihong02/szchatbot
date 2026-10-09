"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 語音輸入（票 05）—— 瀏覽器原生 Web Speech API。
 *
 * - `zh-HK`（粵語）優先；若瀏覽器報 `language-not-supported`，自動回落 `zh-CN`。
 * - 支援度：Chrome / Edge 佳；Safari / Firefox 多不支援 → `supported` 為 false，UI 需提示手打。
 * - **接縫**：對外只暴露 start/stop，日後要換雲端 ASR（Whisper / 訊飛），改此檔即可，UI 不動。
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

function getCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechInput {
  supported: boolean;
  listening: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * @param onText 每段辨識文字回呼（interim 與 final 都會呼叫；final 段落已定稿）
 */
export function useSpeechInput(onText: (text: string, isFinal: boolean) => void): SpeechInput {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecognitionLike | null>(null);
  const langRef = useRef<string>("zh-HK");
  const retriedRef = useRef(false);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    setSupported(getCtor() !== null);
    return () => recRef.current?.abort();
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("此瀏覽器不支援語音輸入，請直接打字。");
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
      const msg =
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "未取得麥克風權限，請在瀏覽器允許後再試。"
          : e.error === "no-speech"
            ? "冇聽到聲音，再試一次？"
            : "語音辨識出錯，請再試一次或直接打字。";
      setError(msg);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setError("未能啟動語音辨識，請再試一次。");
    }
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { supported, listening, error, start, stop, toggle };
}
