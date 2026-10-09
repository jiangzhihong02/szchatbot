// UI 尚未实现 —— 正式聊天界面见任务票「聊天界面與卡片組件」。
// 聊天界面原型的完整變體集（A/B/C）保存在 `prototype/chat-ui` 分支。
export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8 text-center">
      <div className="max-w-md">
        <p className="text-4xl">🌆</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">深圳旅遊助手</h1>
        <p className="mt-2 text-sm text-slate-500">
          UI 尚未實現。決策已定：手機 → A 對話優先、桌面 → C 分欄指令台（按 UA 分發）。
        </p>
        <p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs text-slate-400 ring-1 ring-slate-900/5">
          原型一手資料在 <code className="text-slate-600">prototype/chat-ui</code> 分支：
          <br />
          <code className="text-slate-600">git checkout prototype/chat-ui &amp;&amp; npm run dev</code>
        </p>
      </div>
    </main>
  );
}
