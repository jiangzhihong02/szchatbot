import type { Locale } from "./config";
import type { IntentKey } from "../presets";

/**
 * UI 文案（票 11）。**三語各自撰寫**，不直譯 —— 每語用母語的自然口吻。
 * 內容數據（路線 / 美食 / 優惠）的三語在 `lib/data/*`，不在此檔。
 */
export interface Messages {
  brand: string;
  tagline: string;
  greeting: string;
  composer: { placeholder: string; send: string };
  voice: {
    label: string;
    stop: string;
    unsupported: string;
    privacy: string;
    notAllowed: string;
    noSpeech: string;
    error: string;
    startFail: string;
  };
  presets: Record<IntentKey, { label: string; hint: string }>;
  headcount: {
    prompt: string;
    oneAdult: string;
    twoAdults: string;
    twoPlusOne: string;
    custom: string;
    customTitle: string;
    adults: string;
    children: string;
    calculate: string;
    back: string;
  };
  desktop: { empty: string; shownRight: string };
  cards: {
    bestFor: string;
    hours: string; // 含 {n}
    cycle: string;
    weatherTitle: string; // 含 {n}
    weatherSample: string;
    night: string;
    wind: string;
    pricingFor: string;
    adultsSuffix: string;
    childrenSuffix: string;
    pay: string;
    foodTitle: string;
    mustTry: string;
    dealTitle: string;
    source: string;
  };
  errors: { generic: string; data: string; calc: string };
  localeLabel: string;
}

export const messages: Record<Locale, Messages> = {
  "zh-Hant": {
    brand: "深圳旅遊助手",
    tagline: "為香港旅客而設",
    greeting:
      "你好！我係你嘅深圳旅遊助手 👋 想搵食、plan 路線、睇天氣定計優惠？可以㩒下面嘅掣，或者直接打字問我。",
    composer: { placeholder: "打訊息，或㩒上面嘅掣…", send: "送出" },
    voice: {
      label: "語音輸入",
      stop: "停止錄音",
      unsupported: "呢個瀏覽器唔支援語音輸入，直接打字就得（Chrome / Edge 支援最好）。",
      privacy:
        "🎤 語音由瀏覽器嘅語音服務辨識（Chrome 會上傳音訊至 Google），本助手唔會儲存錄音。",
      notAllowed: "未取得麥克風權限，請喺瀏覽器允許後再試。",
      noSpeech: "冇聽到聲音，再試一次？",
      error: "語音辨識出錯，請再試一次或者直接打字。",
      startFail: "未能啟動語音辨識，請再試一次。",
    },
    presets: {
      food: { label: "找美食", hint: "3–4 家精選" },
      day: { label: "一日遊路線", hint: "主推 + 換一條" },
      family: { label: "親子路線", hint: "帶小孩首選" },
      weather: { label: "查天氣", hint: "今日＋未來 2 天" },
      pricing: { label: "算優惠＋交通", hint: "按人數計" },
      deals: { label: "深圳優惠活動", hint: "門票 / 支付" },
    },
    headcount: {
      prompt: "幾位大人？有冇小朋友？",
      oneAdult: "1 大人",
      twoAdults: "2 大人",
      twoPlusOne: "2 大 1 小",
      custom: "自訂",
      customTitle: "自訂人數",
      adults: "大人",
      children: "小孩",
      calculate: "計算",
      back: "返回",
    },
    desktop: { empty: "左邊揀一個動作，或者直接打字問我", shownRight: "已在右側顯示" },
    cards: {
      bestFor: "適合",
      hours: "約 {n} 小時",
      cycle: "換一條",
      weatherTitle: "未來 {n} 天",
      weatherSample: "示例",
      night: "夜",
      wind: "風",
      pricingFor: "為你計算",
      adultsSuffix: "位大人",
      childrenSuffix: "位小孩",
      pay: "香港旅客支付",
      foodTitle: "精選美食",
      mustTry: "必試",
      dealTitle: "深圳優惠活動",
      source: "來源",
    },
    errors: {
      generic: "抱歉，暫時有啲問題，請再試一次。",
      data: "抱歉，暫時攞唔到資料，請再試一次。",
      calc: "抱歉，暫時計唔到，請再試一次。",
    },
    localeLabel: "語言",
  },

  "zh-Hans": {
    brand: "深圳旅游助手",
    tagline: "为来深圳的旅客而设",
    greeting:
      "你好！我是你的深圳旅游助手 👋 想找好吃的、规划路线、看天气还是算优惠？点下面的按钮，或者直接打字问我。",
    composer: { placeholder: "输入消息，或点上面的按钮…", send: "发送" },
    voice: {
      label: "语音输入",
      stop: "停止录音",
      unsupported: "这个浏览器不支持语音输入，直接打字就行（Chrome / Edge 支持最好）。",
      privacy:
        "🎤 语音由浏览器的语音服务识别（Chrome 会把音频上传到 Google），本助手不会保存录音。",
      notAllowed: "没有拿到麦克风权限，请在浏览器里允许后再试。",
      noSpeech: "没听到声音，再试一次？",
      error: "语音识别出错了，请再试一次或直接打字。",
      startFail: "没能启动语音识别，请再试一次。",
    },
    presets: {
      food: { label: "找美食", hint: "3–4 家精选" },
      day: { label: "一日游路线", hint: "主推 + 换一条" },
      family: { label: "亲子路线", hint: "带小孩首选" },
      weather: { label: "查天气", hint: "今天＋未来 2 天" },
      pricing: { label: "算优惠＋交通", hint: "按人数算" },
      deals: { label: "深圳优惠活动", hint: "门票 / 支付" },
    },
    headcount: {
      prompt: "几位大人？有小朋友吗？",
      oneAdult: "1 位大人",
      twoAdults: "2 位大人",
      twoPlusOne: "2 大 1 小",
      custom: "自定义",
      customTitle: "自定义人数",
      adults: "大人",
      children: "小孩",
      calculate: "计算",
      back: "返回",
    },
    desktop: { empty: "左边选一个动作，或者直接打字问我", shownRight: "已在右侧显示" },
    cards: {
      bestFor: "适合",
      hours: "约 {n} 小时",
      cycle: "换一条",
      weatherTitle: "未来 {n} 天",
      weatherSample: "示例",
      night: "夜间",
      wind: "风",
      pricingFor: "为你计算",
      adultsSuffix: "位大人",
      childrenSuffix: "位小孩",
      pay: "支付方式（香港旅客）",
      foodTitle: "精选美食",
      mustTry: "必试",
      dealTitle: "深圳优惠活动",
      source: "来源",
    },
    errors: {
      generic: "抱歉，出了点问题，请再试一次。",
      data: "抱歉，暂时拿不到数据，请再试一次。",
      calc: "抱歉，暂时算不出来，请再试一次。",
    },
    localeLabel: "语言",
  },

  en: {
    brand: "Shenzhen Travel Assistant",
    tagline: "For visitors from Hong Kong",
    greeting:
      "Hi! I'm your Shenzhen travel assistant 👋 Looking for food, a route, the weather, or a deal? Tap a button below, or just type your question.",
    composer: { placeholder: "Type a message, or tap a button above…", send: "Send" },
    voice: {
      label: "Voice input",
      stop: "Stop recording",
      unsupported:
        "This browser doesn't support voice input — just type instead (Chrome or Edge works best).",
      privacy:
        "🎤 Speech is recognised by your browser's speech service (Chrome sends audio to Google). This assistant doesn't store recordings.",
      notAllowed: "Microphone permission wasn't granted — allow it in your browser and try again.",
      noSpeech: "Didn't catch that — try again?",
      error: "Speech recognition hit an error. Try again, or just type.",
      startFail: "Couldn't start speech recognition. Please try again.",
    },
    presets: {
      food: { label: "Find food", hint: "3–4 picks" },
      day: { label: "Day route", hint: "Top pick + next" },
      family: { label: "Family route", hint: "With kids" },
      weather: { label: "Weather", hint: "Today + 2 days" },
      pricing: { label: "Deals + transport", hint: "By party size" },
      deals: { label: "Shenzhen deals", hint: "Tickets / payment" },
    },
    headcount: {
      prompt: "How many adults, and any children?",
      oneAdult: "1 adult",
      twoAdults: "2 adults",
      twoPlusOne: "2 adults + 1 child",
      custom: "Custom",
      customTitle: "Custom party size",
      adults: "Adults",
      children: "Children",
      calculate: "Calculate",
      back: "Back",
    },
    desktop: { empty: "Pick an action on the left, or just type your question", shownRight: "Shown on the right" },
    cards: {
      bestFor: "Best for",
      hours: "About {n} hours",
      cycle: "Another route",
      weatherTitle: "Next {n} days",
      weatherSample: "sample",
      night: "Night",
      wind: "wind",
      pricingFor: "For",
      adultsSuffix: "adults",
      childrenSuffix: "children",
      pay: "Payment for HK visitors",
      foodTitle: "Selected food",
      mustTry: "Must try",
      dealTitle: "Shenzhen deals",
      source: "Source",
    },
    errors: {
      generic: "Sorry, something went wrong — please try again.",
      data: "Sorry, couldn't fetch that just now — please try again.",
      calc: "Sorry, couldn't calculate that just now — please try again.",
    },
    localeLabel: "Language",
  },
};

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
