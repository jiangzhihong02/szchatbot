# 任务：语音输入（浏览器 Web Speech API）

Type: task
Status: resolved
Label: wayfinder:task

## Question

给聊天框加**语音转文字**输入：麦克风按钮 → 浏览器原生 `SpeechRecognition` → 识别文本填入输入框。

要做的：

- `lang` 优先 `zh-HK`（粤语），回落 `zh-CN`。
- 麦克风按钮的**录音中/空闲**状态与动画。
- **权限与降级**：浏览器不支持（Safari/Firefox）或用户拒绝授权时的提示与回退（提示用手打）。
- 录音权限的**隐私提示**文案（面向香港游客）。
- 代码留**云端 ASR 接缝**：把识别封装成一个 adapter，将来可换讯飞/Whisper。

产出：可用的语音输入按钮 + 降级处理。

## Blocked by

（無）

## Answer

**產出。**

- **`src/lib/speech.ts`**：`useSpeechInput` hook，封裝瀏覽器原生 Web Speech API。
  - `zh-HK`（粵語）優先；瀏覽器報 `language-not-supported` 時**自動回落 `zh-CN` 一次**。
  - 對外只暴露 `supported / listening / error / start / stop / toggle` —— 即**雲端 ASR 接縫**：日後換 Whisper / 訊飛只改此檔，UI 不動。
  - 卸載時 `abort()`；`start()` 有 try/catch。
- **`src/components/chat/parts.tsx`**：`MicButton`。辨識中的**臨時文字填入輸入框**；**定稿直接送出**。錄音中紅色脈動。不支援 / 出錯 / 權限被拒皆以**對話訊息**提示（經 `useChat.note`）。
- 首次使用彈一次性**隱私說明**：語音由瀏覽器語音服務辨識（Chrome 會上傳音訊至 Google），本助手不儲存錄音 —— **如實告知，不假稱本地處理**。
- 兩個版面（手機 / 桌面）皆接上，取代原本的停用佔位按鈕。

**驗證**：`tsc` 乾淨；冒煙 81 項全過。**瀏覽器端行為未經自動驗證**（需 Chrome / Edge + 麥克風權限；純 Node 無法測 Web Speech），待人工確認。

**已知限制**：Safari / Firefox 多不支援 → 按鈕會提示改用打字（優雅降級）。
