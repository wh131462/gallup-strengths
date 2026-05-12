## Context

AI 报告由 `aiService.analyzeStrengths` 通过用户配置的 OpenAI 兼容 endpoint 生成。当前流程：ResultsPage 挂载时单次调用，失败则把 `error.message` 写入 `reportError` 状态并显示一个简单的『重试』按钮。问题：

- 临时性网络/限流错误（fetch 抛错、429、5xx）需要用户手动重试，而这类错误通常一次退避即可恢复。
- 报告生成成功后没有任何主动再生成入口，用户对结果不满意只能清掉历史重测。
- 重试期间 UI 仍是静态骨架屏，用户无法判断系统是否在工作。

约束：

- 不引入新依赖；保留现有 `AIConfigError` 语义；不改 `HistoryEntry` schema。
- 重试逻辑必须可取消（用户在结果页之间切换或离开时不应继续后台请求）。

## Goals / Non-Goals

**Goals:**
- 对瞬时错误（network error / HTTP 429 / HTTP 5xx）做指数退避自动重试。
- 通过回调把『第几次尝试』传给 UI，渲染 `Retrying (1/3)…` 状态���
- 提供用户主动『重新生成』入口（结果卡片 + 阅读弹层），覆盖本地历史。
- 失败语义清晰：配置错误 / 4xx（非 429）不重试，直接展示错误并允许手动重试。

**Non-Goals:**
- 不做服务端代理或缓存。
- 不做多供应商 fallback（已有的 ai-model-config 不在本变更范围）。
- 不做后台异步生成 / 离线队列。
- 不引入 AbortController 之外的取消机制。

## Decisions

### Decision 1：重试策略放在 `aiService` 层，而非组件层
- 在 `analyzeStrengths` 内用 while 循环 + `await sleep(backoff)` 实现，最多 `maxAttempts`（默认 3 = 1 次初始 + 2 次重试）。
- 退避：`500ms * 2^(attempt-1)`，加 ±20% 抖动，上限 4s。
- 仅以下情形视为可重试：`TypeError`（fetch 网络层）/ `response.status === 429` / `response.status >= 500`。其它（包括 `AIConfigError`、401、400 等）立即抛出。
- **Alternative considered**：在 ResultsPage 用 useEffect 包一层。**Rejected**：会让历史回写、ReportReader 等多个入口各自实现一遍，且难以与 AbortSignal 协调。

### Decision 2：进度通过 options 回调暴露，而非新 hook
- `analyzeStrengths(themes, { onAttempt?: (info: { attempt: number; max: number; reason: 'initial' | 'retry' }) => void, signal?: AbortSignal })`。
- 调用方在 useEffect 中维护 `retryState` 状态，渲染本地化文案。
- **Alternative considered**：引入 react-query。**Rejected**：项目无该依赖，单点调用不值得引入。

### Decision 3：『重新生成』复用同一函数，但显式标记意图
- 新增 `regenerate` 本地状态（boolean），按下按钮时：清空 `aiReport`、`reportError`，调用 `runAnalysis(savedThemes, { force: true })`。
- 成功后用同样的 `updateHistoryEntry` 调用覆盖 `advisorReport` 字段（已有逻辑，直接复用）。
- 在 ReportReader 底部追加同一个按钮，通过 props 注入 handler，避免在 Reader 内复制状态。

### Decision 4：i18n key 放在 `common` 与 `results` 命名空间
- `common:retrying`（带 `{{attempt}}/{{max}}` 插值）、`common:regenerate`、`results:regenerateHint`。
- 复用已有的 `common:retry` 文案，不改语义。

## Risks / Trade-offs

- **风险**：用户在重试期间切走页面，后台仍在退避。→ **缓解**：ResultsPage useEffect cleanup 调用 `controller.abort()`，aiService 在 sleep 之间检查 `signal.aborted` 并抛 `AbortError`。
- **风险**：429 自动重试可能放大限流。→ **缓解**：退避 + 抖动 + 最多 2 次重试；尊重响应中的 `Retry-After` 头（若存在且 ≤ 10s 则采用，否则用默认退避）。
- **权衡**：『重新生成』会直接覆盖旧报告，用户无法回退到上一版。→ 当前历史 schema 只存一份 `advisorReport`，扩展为数组超出范围；在 UI 文案中提示『将替换当前报告』。
- **风险**：i18n key 漏译会让按钮显示原始 key。→ 在 zh/en 两份 locale 同步新增并由 CI（`scripts/checkI18n.cjs`）校验。
