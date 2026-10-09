# 任务：语音输入（浏览器 Web Speech API）

Type: task
Status: open
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

（无）
