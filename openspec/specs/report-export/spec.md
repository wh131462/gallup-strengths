# Report Export Specification

## Purpose

The `report-export` capability lets users download the contents of their Strengths Navigator results page as a structured GitHub-Flavored Markdown file. It replaces the previous `window.print()`-based "export" flow, which depended on the browser's print dialog and produced visually broken PDFs that included unrelated UI chrome (navigation, modals, buttons). This capability covers what gets serialized, the file naming convention, localization rules, and the guarantee that exporting never mutates persisted state.

## Requirements

### Requirement: 一键下载结果页 Markdown 报告

系统 SHALL 在结果页与报告阅读弹窗的「导出」按钮被点击时，立刻在浏览器中触发下载一份 `.md` 文件，文件包含整张结果页的可读内容（元信息、五大主导特质摘要、四大领域得分、AI 顾问报告全文）。

系统 MUST NOT 在导出流程中调用 `window.print()` 或弹出浏览器原生打印对话框。

#### Scenario: 已生成 AI 报告时从结果页导出
- **WHEN** 用户在结果页（非 readonly）已有 AI 报告，点击「导出」按钮
- **THEN** 浏览器立刻下载文件名为 `strengths-report-YYYY-MM-DD.md` 的文件
- **AND** 文件内容依次包含标题、生成日期、UI 语言、模型名（若有）、五大主导特质表、四大领域得分表、AI 报告 Markdown 原文
- **AND** 不出现浏览器打印对话框

#### Scenario: 从报告阅读弹窗导出
- **WHEN** 用户在 ReportReaderModal 中点击「导出」按钮
- **THEN** 浏览器立刻下载与结果页导出格式一致的 `.md` 文件
- **AND** 弹窗保持打开状态，用户可继续阅读

#### Scenario: AI 报告尚未生成时导出
- **WHEN** 用户在结果页（含 readonly 历史项无 AI 报告的情况）点击「导出」，且当前 `aiReport` 为空
- **THEN** 系统仍下载一份 `.md` 文件，包含元信息、五大主导特质表、四大领域得分表
- **AND** 在 AI 报告段落处写入占位文本说明「AI 报告未生成」（按当前 UI 语言本地化）

### Requirement: 文件名稳定且按日期命名

系统 SHALL 使用 `strengths-report-YYYY-MM-DD.md` 作为下载文件名，其中日期为本地时区当天的 ISO 日期段。

#### Scenario: 单日多次导出
- **WHEN** 用户在 2026-05-11 当天多次点击导出
- **THEN** 每次下载使用相同基名 `strengths-report-2026-05-11.md`
- **AND** 浏览器自行处理重名（典型行为是追加 ` (1)`、` (2)`）

### Requirement: 导出内容随 UI 语言本地化

系统 SHALL 使用当前展示语言（readonly 历史项使用其保存时的 `language`，非 readonly 使用当前 `i18n.language`）渲染导出文档中的标题、表头、领域名等结构性文本；AI 报告原文保持其生成时的语言不变。

#### Scenario: 中文界面导出
- **WHEN** 当前 UI 语言为 `zh`，用户导出
- **THEN** 文档标题、章节标题、表头、四大领域名以中文呈现

#### Scenario: 英文界面导出
- **WHEN** 当前 UI 语言为 `en`，用户导出
- **THEN** 文档标题、章节标题、表头、四大领域名以英文呈现

### Requirement: 不污染历史与持久化状态

系统 MUST NOT 在执行导出时修改 localStorage、历史记录、AI 报告快照或任何持久化状态。导出仅产生一次性下载副作用。

#### Scenario: 导出后历史保持不变
- **WHEN** 用户对一条 readonly 历史项导出
- **THEN** 该历史项的 `entries`、`updatedAt`、`advisorReport` 字段在 localStorage 中均无变化

### Requirement: 导出文档使用 GFM Markdown

系统 SHALL 使用 GitHub Flavored Markdown 格式生成文档：标题用 `#`/`##`、表格用管道语法、列表用 `-`，AI 报告原文不做转义或修改地拼接到文档末尾。

#### Scenario: 表格能在常见查看器中正确渲染
- **WHEN** 用户用 GitHub、VSCode 预览或 Typora 打开导出的 `.md`
- **THEN** 五大主导特质与领域得分以表格形式正确显示
