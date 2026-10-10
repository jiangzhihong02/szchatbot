// 冒煙檢查的共用骨架 —— 六個 check 腳本本來各自複製了一份同樣的 12 行。
// 抽出來之後，改「失敗時怎麼報」只需要動這一個地方。

export interface Checker {
  /** 記一項斷言。 */
  check(label: string, ok: boolean): void;
  /** 印總結並以退出碼結束（0 = 全過）。 */
  report(): never;
}

export function makeChecker(): Checker {
  let passed = 0;
  const failures: string[] = [];

  return {
    check(label, ok) {
      if (ok) passed++;
      else failures.push(label);
    },
    report() {
      console.log(`\n✅ 通過 ${passed} 項`);
      if (failures.length) {
        console.log(`❌ 失敗 ${failures.length} 項：`);
        for (const f of failures) console.log(`   - ${f}`);
      }
      process.exit(failures.length === 0 ? 0 : 1);
    },
  };
}
