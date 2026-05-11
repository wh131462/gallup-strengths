## Why

当前顾问报告（Advisor Perspective / Full Synthesis Report）以纯文本渲染（`whitespace-pre-wrap` + `substring(0, 300)`），AI 返回的 Markdown 语法（`##`、`**`、列表、表格等）原样显示，既破坏排版也削弱阅读体验；完整报告与其它 UI 块并列排布，在小屏上阅读连贯性差，用户需要一个专注阅读的界面来完整浏览报告。

## What Changes

- 引入 Markdown 渲染器（`react-markdown` + `remark-gfm`），统一渲染顾问报告的所有文本内容
- 顾问视角卡片（`advisorPerspective`）：用截断后的 Markdown 预览替换当前的 `substring(0, 300)` 纯文本预览
- 顾问视角卡片底部新增「阅读完整报告」按钮，点击打开一个全屏阅读弹窗（Reading Modal）
- 阅读弹窗：承载完整 Markdown 渲染的顾问报告，支持滚动、关闭（ESC / 背景点击 / 关闭按钮）、复制/导出入口
- 原「Full AI Report Body」块（页面底部长报告区域）保留完整 Markdown 渲染，或在弹窗方案下精简为触发入口（见 design.md）
- 为 Markdown 渲染应用与现有 prose 设计一致的排版样式（标题、段落、列表、引用、代码块、深色模式）
- 新增相关 i18n 文案（打开/关闭阅读、复制、导出 PDF 等）

## Capabilities

### New Capabilities
- `advisor-report-rendering`: 顾问报告的 Markdown 渲染与专注阅读弹窗能力

### Modified Capabilities
<!-- 无现有 spec 受影响 -->

## Impact

- [src/components/ResultsPage.tsx](src/components/ResultsPage.tsx)：替换顾问报告渲染方式，新增阅读弹窗触发
- 新增组件 `src/components/MarkdownRenderer.tsx`：Markdown → React 元素，统一排版样式
- 新增组件 `src/components/ReportReaderModal.tsx`：全屏阅读弹窗
- [src/i18n/locales/zh/results.json](src/i18n/locales/zh/results.json) 与 `en/results.json`：新增阅读弹窗相关文案
- [package.json](package.json)：新增依赖 `react-markdown`、`remark-gfm`
- 无后端/API 变更；无 AI 服务层变更
