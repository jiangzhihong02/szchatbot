/**
 * 共用的樣式片段 —— 消除 Button 與 IconButton 之間逐字重複的類名串。
 */

/** 鍵盤聚焦可見環（a11y）。所有互動元件共用，故只寫一處。 */
export const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

/** 主要動作的表面：旅行綠 + V2 柔和浮起（靜置投影、hover 加深抬升）。 */
export const PRIMARY_SURFACE =
  "bg-primary text-on-primary shadow-btn hover:bg-primary-hover hover:-translate-y-px hover:shadow-btn-hover";
