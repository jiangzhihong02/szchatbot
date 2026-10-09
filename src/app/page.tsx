import { headers } from "next/headers";
import { MobileChat } from "@/components/chat/MobileChat";
import { DesktopConsole } from "@/components/chat/DesktopConsole";
import { resolveVariant } from "@/lib/device";

/**
 * 深圳旅遊助手首頁。
 * 按使用者代理分發介面結構（票 02 的 verdict；見 docs/adr/0002-device-based-layout-routing.md）：
 *   手機 → 對話優先；桌面 → 分欄指令台。判斷本身在 `lib/device`（純、可表驅動測試）。
 * 讀 headers() 需動態渲染，故 instant = false（Next 16 Cache Components）。
 */
export const instant = false;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const ua = (await headers()).get("user-agent") ?? "";
  return resolveVariant(ua, variant) === "mobile" ? <MobileChat /> : <DesktopConsole />;
}
