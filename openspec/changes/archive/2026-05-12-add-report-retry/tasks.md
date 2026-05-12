## 1. aiService 重试核心

- [x] 1.1 在 [src/services/aiService.ts](src/services/aiService.ts) 定义 `AnalyzeOptions { onAttempt?, signal?, maxAttempts? }` 与内部 `isTransient(err|status)` 判定（fetch TypeError / 429 / 5xx）
- [x] 1.2 将现有 fetch 逻辑抽到 `executeOnce(messages, signal)`，返回成功 markdown 或抛出带 `status` 字段的错误
- [x] 1.3 在 `analyzeStrengths` 外层加入 retry 循环：指数退避 `500ms * 2^(n-1)` + ±20% 抖动 + 4s 上限；尊重 `Retry-After`（≤10s）
- [x] 1.4 实现可中断的 `sleep(ms, signal)`：监听 `abort` 事件并立即 reject
- [x] 1.5 在每次尝试前调用 `onAttempt({ attempt, max, reason })`；非瞬时错误立即 throw 不重试

## 2. ResultsPage 集成

- [x] 2.1 在 [src/components/ResultsPage.tsx](src/components/ResultsPage.tsx) 新增 `retryState` 状态（`{ attempt, max } | null`）
- [x] 2.2 `runAnalysis` 创建 `AbortController`，传入 `signal` 与 `onAttempt`；useEffect cleanup 调用 `controller.abort()`
- [x] 2.3 在 loading 区块中：`retryState && retryState.attempt > 1` 时渲染 `common:retrying` 文案，否则保留骨架屏
- [x] 2.4 在成功分支（`aiReport && !reportError`）的卡片底部添加 `Regenerate` 按钮，处于 `regenerating` 时禁用并显示 `common:regenerating`
- [x] 2.5 `handleRegenerate` 清空 `aiReport` + `reportError` 后调用 `runAnalysis(savedThemes)`；成功后通过既有 `updateHistoryEntry` 覆盖 `advisorReport`
- [x] 2.6 readonly 且无 `savedThemes` 时不渲染 Regenerate 按钮

## 3. ReportReader 入口

- [x] 3.1 在 [src/components/ReportReader.tsx](src/components/ReportReader.tsx) 接收 `onRegenerate?: () => void` 与 `regenerating?: boolean` props
- [x] 3.2 在 Reader 底部工具栏渲染 Regenerate 按钮（与导出按钮风格一致），未传 `onRegenerate` 时隐藏
- [x] 3.3 ResultsPage 把 `handleRegenerate` / `regenerating` 透传给 Reader，确保关闭按钮在 regenerating 期间仍可用

## 4. i18n 文案

- [x] 4.1 在 `public/locales/zh/common.json` 与 `public/locales/en/common.json` 增加 `retrying`（含 `{{attempt}}/{{max}}`）、`regenerate`、`regenerating`
- [x] 4.2 在 `public/locales/{zh,en}/results.json` 增加 `regenerateHint`（『将替换当前报告』/ `Will replace the current report`）
- [x] 4.3 运行 `node scripts/checkI18n.cjs` 确认无缺失 key

## 5. 验证

- [x] 5.1 `npm run typecheck` / `npm run lint` 通过
- [ ] 5.2 手动用 DevTools 在 OPTIONS 阶段拦截首个请求返回 429，确认 UI 显示 `Retrying (2/3)` 后恢复
- [ ] 5.3 手动断网→恢复，确认自动重试成功且仅一次 onAttempt(reason:'initial')
- [ ] 5.4 点击 Regenerate（在卡片与 Reader 内各一次），刷新页面验证历史记录中的 `advisorReport` 已被覆盖
- [ ] 5.5 在 retry 退避期间跳转回首页，确认控制台无后续 fetch 日志（abort 生效）
