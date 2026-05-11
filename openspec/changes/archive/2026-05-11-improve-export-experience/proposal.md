## Why

当前结果页与报告阅读弹窗的「导出」按钮直接调用 `window.print()`，体验很差：

- Tailwind 卡片背景、边框、深浅主题色在浏览器打印对话框里大量丢失或错位，排版破碎；
- 没有任何 `@media print` 规则隔离，导航、按钮、设置弹窗、modal 蒙层等无关 UI 也会被打印进 PDF；
- 中文用户对原生「打印」对话框不直觉——他们想要的是「下载报告」，而不是手动「另存为 PDF」。

这导致用户花时间生成的 AI 报告无法被干净地保存或分享，是已上线功能里最显眼的体验黑洞之一。

## What Changes

- 新增 `report-export` 能力：将结果页内容序列化为结构化 Markdown 文档并直接下载为 `.md` 文件。
- 替换 `ResultsPage` 与 `ReportReaderModal` 中「导出」按钮的行为：从 `window.print()` 改为调用统一的 Markdown 导出函数，触发浏览器下载。
- 导出范围覆盖整个结果页内容：元信息（生成日期、语言）、五大主导特质摘要（名称 + 得分 + 简介）、AI 顾问报告全文。
- 文件命名规则：`strengths-report-YYYY-MM-DD.md`，包含可读日期，便于多次导出区分。
- **BREAKING**：移除两个调用点对 `window.print()` 的依赖；用户原先依赖打印对话框「另存为 PDF」的工作流不再可用，需通过浏览器/编辑器自行将 Markdown 转换。
- 新增 i18n 文案：导出失败提示（如缺少报告时禁用按钮的 tooltip）；复用已有 `results:export` key。

## Capabilities

### New Capabilities

- `report-export`：把结果页（用户元信息 + 主导特质摘要 + AI 报告正文）序列化为结构化 Markdown 文件并触发浏览器下载，文件名包含日期。

### Modified Capabilities

<!-- 无现有 spec 的需求级行为受影响：i18n 仅新增文案，ai-model-config 不变。 -->

## Impact

- 代码：
  - `src/components/ResultsPage.tsx`（导出按钮 onClick）
  - `src/components/ReportReaderModal.tsx`（导出按钮 onClick）
  - 新增 `src/services/reportExport.ts`（Markdown 序列化 + 下载）
  - `src/i18n/locales/*/results.json`（新增导出相关文案 key，如禁用提示）
- 依赖：无新增运行时依赖；复用 `historyStorage.ts` 的 Blob + `URL.createObjectURL` + `<a download>` 模式。
- 数据：不修改持久化结构；只读消费 `AdvisorReportSnapshot` 与当前测试结果。
- 风险：旧的 `window.print()` 路径会被移除，无 PDF 直接导出；可在后续迭代中通过额外能力补充（不在此变更范围内）。
