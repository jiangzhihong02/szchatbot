import { createHash } from "node:crypto";

/**
 * 高德 Web 服務的「數字簽名」（sig）—— 純函式：不讀環境、不碰網路，故可直接單測。
 *
 * 官方規則逐字（lbs.amap.com/faq/quota-key/key/41181）：
 *   「签名格式：sig=MD5(请求参数（包括key）键值对（按参数名的升序排序），
 *     加（请注意"加"字无需输入）私钥)」
 *
 * 三個最容易做錯的地方：
 *   1. **key 本身要算進去**——只有 sig 不算（它是算完才追加的）；
 *   2. 排序對象是**參數名**，升序，區分大小寫（故用 `<` 比較，不用 localeCompare）；
 *   3. 哈希用的是**原始值**，不是 urlencode 之後的值。官方原話：「在计算md5的参数
 *      如果出现＋号，请正常计算sig，但在请求的时候，需要用urlencode进行编码再请求。」
 *      本專案靜態地圖的參數滿是 `,` `:` `|` `;`，兩種取法算出的 sig 完全不同——
 *      `amap.ts` 的 `signedQuery()` 因此把「拿來哈希的」與「送出去的」分成兩條路。
 *
 * 輸出為 32 字元**小寫**十六進位。大小寫官方文件沒寫，但所有可運作的實作皆為小寫。
 */
export function amapSig(params: Record<string, string>, secret: string): string {
  const canonical = Object.entries(params)
    .filter(([name]) => name !== "sig")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${name}=${value}`)
    .join("&");

  return createHash("md5").update(canonical + secret, "utf8").digest("hex");
}
