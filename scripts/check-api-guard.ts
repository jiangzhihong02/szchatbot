// 冒烟检查：/api 的同源閘（lib/same-origin）。运行：npx tsx scripts/check-api-guard.ts
// 這道閘是「付費端點別被外人白吃」的唯一防線，所以每個分支都要有斷言釘住。
import { isSameOrigin } from "../src/lib/same-origin";
import { makeChecker } from "./_check";

const { check, report } = makeChecker();

/** 造一組請求標頭。 */
const H = (init: Record<string, string>) => new Headers(init);

async function main() {
  const SITE = "https://sz.example";

  // ── 1. 以 Sec-Fetch-Site 為準（現代瀏覽器）──
  check(
    "Chrome 同源 POST（兩個標頭都在）",
    isSameOrigin(H({ "sec-fetch-site": "same-origin", origin: SITE, host: "sz.example" }))
  );
  check(
    "跨站 fetch → 拒",
    !isSameOrigin(H({ "sec-fetch-site": "cross-site", origin: "https://evil.example", host: "sz.example" }))
  );
  check(
    "同站不同源（子網域）→ 拒",
    !isSameOrigin(H({ "sec-fetch-site": "same-site", origin: "https://a.sz.example", host: "sz.example" }))
  );
  check(
    "Sec-Fetch-Site 為準：即使 Origin 相符，cross-site 仍拒",
    !isSameOrigin(H({ "sec-fetch-site": "cross-site", origin: SITE, host: "sz.example" }))
  );

  // ── 2. 沒有 Sec-Fetch-Site 時退回 Origin（較舊的瀏覽器）──
  check("舊瀏覽器：Origin 相符 → 放行", isSameOrigin(H({ origin: SITE, host: "sz.example" })));
  check("舊瀏覽器：Origin 不符 → 拒", !isSameOrigin(H({ origin: "https://evil.example", host: "sz.example" })));
  check(
    "舊瀏覽器：有 Origin 但無 host → 拒",
    !isSameOrigin(H({ origin: SITE }))
  );

  // ── 3. Vercel：Origin 對的是對外網域，host 是內部位址 ──
  check(
    "Vercel：x-forwarded-host 相符 → 放行",
    isSameOrigin(H({ origin: "https://sz.vercel.app", "x-forwarded-host": "sz.vercel.app", host: "10.0.0.7:3000" }))
  );
  check(
    "Vercel：x-forwarded-host 不符 → 拒",
    !isSameOrigin(H({ origin: "https://evil.example", "x-forwarded-host": "sz.vercel.app" }))
  );

  // ── 4. 非瀏覽器客戶端（真正的濫用向量）：兩個標頭都沒有 ──
  check("curl（完全無標頭）→ 拒", !isSameOrigin(H({})));
  check("curl 只帶 host → 拒", !isSameOrigin(H({ host: "sz.example" })));
  check("curl 偽造 Origin 但不帶 Sec-Fetch-Site → 放行（已知界線）", isSameOrigin(H({ origin: SITE, host: "sz.example" })));

  // ── 5. 壞資料不得炸，也不得放行 ──
  check("Origin: null → 拒", !isSameOrigin(H({ origin: "null", host: "sz.example" })));
  check("Origin 非 URL → 拒", !isSameOrigin(H({ origin: "not a url", host: "sz.example" })));
  check("Origin 是相對路徑 → 拒", !isSameOrigin(H({ origin: "/api/chat", host: "sz.example" })));

  // ── 6. 埠號算進 host，本機開發要能過 ──
  check("本機開發 → 放行", isSameOrigin(H({ origin: "http://localhost:3000", host: "localhost:3000" })));
  check("埠號不同 → 拒", !isSameOrigin(H({ origin: "http://localhost:3001", host: "localhost:3000" })));

  report();
}

main();
