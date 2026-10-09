/** 極簡模板替換：`fmt("約 {n} 小時", { n: 6 })` → 「約 6 小時」。 */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
