## Why

AI 报告生成依赖外部 LLM，常因网络抖动、限流（429）或临时 5xx 失败，目前用户必须手动点『重试』，体验割裂；同时即使首轮成功，用户也无法对不满意的报告再生成一次。需要更稳健的失败恢复 + 用户主动重试入口。

## What Changes

- 在 `aiService.analyzeStrengths` 内对网络错误 / 429 / 5xx 实现指数退避自动重试（最多 N 次，默认 2 次），4xx（除 429）和配置类错误直接抛出不重试
- ResultsPage 在重试期间通过新增的进度回调展示 `正在重试 (1/3)…` 文案，替代静态骨架屏
- 报告成功生成后，在结果卡片与阅读弹层底部新增『重新生成』按钮，触发一次新的报告生成并覆盖本地历史中的 `advisorReport`
- 在 i18n（zh/en）补充 `retrying`、`regenerate`、`regenerating` 等文案键

## Capabilities

### New Capabilities
- `report-retry`: AI 报告生成的自动重试策略、进度反馈与用户主动『重新生成』能力

### Modified Capabilities
_(无 — 现有 specs 中没有覆盖报告生成行为的能力，相关逻辑此前未规约化。)_

## Impact

- 代码：[src/services/aiService.ts](src/services/aiService.ts)（新增 retry/进度回调）、[src/components/ResultsPage.tsx](src/components/ResultsPage.tsx)（重试状态 UI、重新生成按钮、历史回写）、[src/components/ReportReader.tsx](src/components/ReportReader.tsx)（弹层底部入口）
- i18n：`public/locales/{zh,en}/{common,results}.json`
- 历史存储：复用既有 `advisorReport` 覆盖写入逻辑，无 schema 变更
- 依赖：无新增
