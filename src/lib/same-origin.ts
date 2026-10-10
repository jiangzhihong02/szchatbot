/**
 * 同源閘：只放行「由本網站自己的頁面發起」的請求。
 *
 * 為什麼需要它：`/api/chat` 是**公網上的付費代理**——它拿伺服器端的金鑰去呼叫 LLM，
 * 每問一次就花一次錢；而網址是公開的。任何人打開 F12 抄下這個端點，寫十行腳本，
 * 就能用**你的錢**跑他自己的對話。這裡不擋，等於把錢包掛在門口。
 *
 * 判斷依據是瀏覽器**自己加上、頁面 JS 無法自行設定**的那組標頭，取兩者之一：
 *   1. `Sec-Fetch-Site` —— 有就以此為準（Chrome 76+／Firefox 90+／Safari 16.4+）；
 *   2. 否則退回 `Origin` —— 同源 POST 一定會帶。
 * 兩者皆無（`curl`、`python-requests`、掃描器）→ 拒收。
 *
 * ⚠️ **這不是萬無一失的**：對方手動補上這兩個標頭就能通過。它的價值在於把
 *    「掃描器順手打一下」和「有人刻意盯著你」分開——前者擋掉，後者擋不住。
 *    針對後者的硬底線是**在 LLM 後台給金鑰設餘額上限**（見 README「安全」）。
 *    **不要**因為有了這道閘就不設上限。
 *
 * 只用在 `/api/chat`。`/api/route-map` 是 `<img src>` 呼叫的，而 `<img>` 不送
 * `Origin`；它燒的又只是有快取的靜態圖配額，套上去的代價（地圖白屏）遠大於收益。
 */

/** 請求實際命中的 host：Vercel 走 `x-forwarded-host`，本機開發走 `host`。 */
function requestHost(headers: Headers): string | null {
  return headers.get("x-forwarded-host") ?? headers.get("host");
}

/** 是否為本網站自己的頁面發起的請求。 */
export function isSameOrigin(headers: Headers): boolean {
  const site = headers.get("sec-fetch-site");
  if (site) return site === "same-origin";

  const origin = headers.get("origin");
  const host = requestHost(headers);
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false; // `Origin: null`、非 URL 字串
  }
}

/** 拒收：非本網站頁面發起的請求。 */
export function forbidden(): Response {
  return new Response(JSON.stringify({ error: "forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
