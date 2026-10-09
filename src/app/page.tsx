import { headers } from "next/headers";
import { MobileChat } from "@/components/chat/MobileChat";
import { DesktopConsole } from "@/components/chat/DesktopConsole";

/**
 * 深圳旅遊助手首頁。
 * 按使用者代理分發介面結構（票 02 的 verdict；見 docs/adr/0002-device-based-layout-routing.md）：
 *   手機 → 對話優先；桌面 → 分欄指令台。
 * 讀 headers() 需動態渲染，故 instant = false（Next 16 Cache Components）。
 */
export const instant = false;

const MOBILE_RE = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export default async function Page() {
  const ua = (await headers()).get("user-agent") ?? "";
  const isMobile = MOBILE_RE.test(ua);
  return isMobile ? <MobileChat /> : <DesktopConsole />;
}
