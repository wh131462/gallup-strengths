## 1. 序列化与下载工具

- [x] 1.1 新建 [src/services/reportExport.ts](src/services/reportExport.ts)，定义入参类型 `ReportExportInput`（包含 `topThemes: StrengthTheme[]`、`domainScores: DomainScoreSnapshot[]`、`aiReport: string | null`、`language: string`、`model?: string`、`generatedAt?: number`、`t: TFunction`）。
- [x] 1.2 在同文件实现纯函数 `buildReportMarkdown(input: ReportExportInput): string`，按设计文档结构拼接：标题 → 元信息（生成时间 / 语言 / 模型） → 五大主导特质表 → 四大领域得分表 → AI 报告原文（无则插入本地化的「AI 报告未生成」占位）。
- [x] 1.3 实现副作用函数 `downloadReportMarkdown(input: ReportExportInput): void`，复用 [historyStorage.ts:111-132](src/services/historyStorage.ts#L111-L132) 的 Blob + `URL.createObjectURL` + 临时 `<a download>` 模式；MIME 使用 `text/markdown;charset=utf-8`，文件名 `strengths-report-${YYYY-MM-DD}.md`（取 `new Date().toISOString().slice(0,10)`）。
- [x] 1.4 表头与领域名通过传入的 `t` 函数本地化，复用现有 i18n 命名空间（`results`、`strengths`），不要在 service 中直接调用 `useTranslation`（保持纯函数 / 易测）。

## 2. i18n 文案

- [x] 2.1 在 [src/i18n/locales/zh/results.json](src/i18n/locales/zh/results.json) 与 [src/i18n/locales/en/results.json](src/i18n/locales/en/results.json) 新增导出文档需要的 key：`exportDocTitle`（"优势导航 · 个人报告" / "Strengths Navigator · Personal Report"）、`exportFieldGeneratedAt`、`exportFieldLanguage`、`exportFieldModel`、`exportSectionTopThemes`、`exportSectionDomainScores`、`exportSectionAdvisorReport`、`exportTableTheme`、`exportTableDomain`、`exportTableRank`、`exportTableScore`、`exportTableMax`、`exportNoAiReport`。
- [x] 2.2 运行 `npm run check-i18n` 确认中英文 key 一致、无遗漏。

## 3. 接入调用点

- [x] 3.1 修改 [src/components/ResultsPage.tsx:365](src/components/ResultsPage.tsx#L365) 的「导出」按钮 `onClick`：移除 `window.print()`，调用 `downloadReportMarkdown({...})`，传入当前 `topThemes`、`domainScores`、`aiReport`、`displayLanguage`、`entry?.advisorReport?.model`、`entry?.advisorReport?.generatedAt`、`t`。
- [x] 3.2 修改 [src/components/ReportReaderModal.tsx:83](src/components/ReportReaderModal.tsx#L83) 的「导出」按钮 `onClick`：同样替换为 `downloadReportMarkdown`；ReportReaderModal 当前未持有 `topThemes`/`domainScores`，需要扩展其 props 接收完整的导出上下文（与 ResultsPage 保持一致），由父组件透传。
- [x] 3.3 在 ResultsPage 渲染 ReportReaderModal 处补全新增 props。

## 4. 验证

- [x] 4.1 运行 `npm run lint` 通过 TypeScript 检查。
- [ ] 4.2 运行 `npm run dev`，在浏览器执行：完成一次测试 → 等 AI 报告生成 → 点结果页「导出」→ 验证下载到 `strengths-report-YYYY-MM-DD.md`，文件包含全部四个章节、表格渲染正确。
- [ ] 4.3 切换 UI 到英文重复 4.2，验证表头与领域名为英文、AI 报告原文不变。
- [ ] 4.4 进入历史记录中的一条 readonly 项（无 AI 报告），点击「导出」，验证文档含特质 + 得分表格、AI 报告章节为本地化的「未生成」占位文本。
- [ ] 4.5 在 ReportReaderModal 中点击「导出」，验证下载成功且 modal 保持打开。
- [ ] 4.6 全程确认无浏览器原生打印对话框出现；导出动作前后 localStorage 中的 `strengths-navigator:test-history` 内容字节级一致。
