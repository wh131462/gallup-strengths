## Context

`ResultsPage` 与 `ReportReaderModal` 当前的「导出」按钮直接调用 `window.print()`：

- 没有任何 `@media print` 规则，浏览器默认会把整张视口（含导航、modal 蒙层、操作按钮）一并写入 PDF；
- Tailwind 的暗色/浅色背景与边框在打印时被浏览器移除或重写，卡片排版破碎；
- 用户实际想要的是「保存这份报告」，而不是「打印」——原生打印对话框在中文用户群里反直觉。

项目里已经存在一套成熟的「Blob + `URL.createObjectURL` + `<a download>`」下载模式（[historyStorage.ts:111-132](src/services/historyStorage.ts#L111-L132)），用于导出历史 JSON。可以直接复用，无需引入新依赖。

报告原始内容已经是 Markdown（`AdvisorReportSnapshot.markdown`），同时五大主导特质和领域得分都在内存里以结构化对象形式存在（`StrengthTheme[]`、`DomainScoreSnapshot[]`），只需要拼接成一份可读的 Markdown 文档即可。

## Goals / Non-Goals

**Goals:**
- 用户点击「导出」后，浏览器立刻下载一份 `.md` 文件，无打印对话框；
- 文件内容包含：标题、生成日期、语言、五大主导特质摘要表、领域得分表、AI 顾问报告全文；
- 文件名稳定可读：`strengths-report-YYYY-MM-DD.md`；
- 在 ResultsPage 与 ReportReaderModal 两个调用点行为完全一致；
- 当 AI 报告尚不存在时，导出按钮在 ReportReaderModal 不可达（modal 不开），在 ResultsPage 仍可导出（仅含主导特质摘要 + 元信息），不应让用户白点失败。

**Non-Goals:**
- PDF 导出（移除 `window.print()` 后短期内不再支持「另存为 PDF」直通）；
- HTML/PNG/图片格式导出；
- 多份报告合并导出、跨历史条目批量导出；
- 自定义导出模板或字段筛选；
- 服务端渲染或离线生成（保持纯前端）。

## Decisions

### Decision 1：用 Markdown 取代打印对话框

**选择**：导出 = 下载 `.md` 文件，移除 `window.print()`。

**理由**：
- AI 报告本身是 Markdown，零损耗（保留标题层级、列表、强调），二次编辑/分发友好；
- 不依赖浏览器的打印 CSS 兼容性，跨浏览器表现稳定；
- 用户期望与「下载」按钮的视觉语义（`Download` 图标）一致；
- 实现成本低，不引入新依赖。

**备选**：
- *PDF（html2pdf / jsPDF）*：体积大（200KB+），中文字体子集化复杂，暗色主题下截图效果差；
- *PNG 长图（html-to-image）*：信息密度低，无法搜索/复制；
- *修复 `@media print` 样式*：仍然受浏览器打印对话框 UX 影响，且要为暗色主题、卡片背景、modal 蒙层各写大量 reset，维护成本高。

PDF/PNG 留作后续独立变更，本次先解决最痛的「下载到本地、内容干净」诉求。

### Decision 2：导出范围 = 整个结果页结构化内容

**选择**：导出文档由四个段落组成（按顺序）：

1. 标题与元信息（生成日期、UI 语言、模型名 if any）；
2. 五大主导特质摘要：表格 / 列表，列出特质名 + 所属领域；
3. 四大领域得分：表格，列出领域名 + 当前得分 / 满分；
4. AI 顾问报告原文（直接拼接 `aiReport` 字符串）。

**理由**：用户答的是「整个结果页全部内容」。如果只导出 AI 报告，离开应用后无法回看自己的得分；如果只导出得分，丢了最有价值的 AI 解读。两者合一最符合「这就是我的报告」直觉。

**结构示意**：
```markdown
# 优势导航 · 个人报告
**生成时间**：2026-05-11
**语言**：zh
**模型**：gpt-4o-mini

## 五大主导特质
| # | 特质 | 领域 |
| - | --- | --- |
| 1 | Strategic | Strategic Thinking |
| ... |

## 领域得分
| 领域 | 得分 | 满分 |
| --- | --- | --- |
| Executing | 12 | 30 |
| ... |

## AI 顾问报告
<aiReport markdown 原文>
```

i18n：标题、列头按当前 UI 语言渲染（复用 `t('results:...')`、`t('strengths:domains.*')`），保证中英文用户拿到的文档语言一致。

### Decision 3：放在 `src/services/reportExport.ts`

**选择**：新增独立 service 文件 `src/services/reportExport.ts`，导出 `buildReportMarkdown(...)` 与 `downloadReportMarkdown(...)` 两个函数。

**理由**：
- 与 `historyStorage.ts` 同层、同模式，便于发现与维护；
- 纯函数 `buildReportMarkdown` 易于单元测试，副作用 `downloadReportMarkdown` 只负责浏览器 IO；
- ResultsPage 与 ReportReaderModal 共享同一份序列化逻辑，避免复制。

**备选**：放在组件文件内 → 复用差、无法单测；放在 `historyStorage.ts` → 职责漂移。

### Decision 4：文件名 `strengths-report-YYYY-MM-DD.md`

**选择**：日期取本地时区 `toISOString().slice(0,10)`，与 `historyStorage.exportHistoryAsJson` 风格一致。

**理由**：
- 多次导出可按文件名排序；
- ASCII-only，避免中文字符在不同 OS 文件系统下的编码问题；
- 日期到天即可，更细粒度对用户无意义且可能因毫秒变动产生噪声。

### Decision 5：按钮禁用而非弹错

**选择**：当 `aiReport` 为 null 且页面不允许「仅导出特质摘要」（如 ReportReaderModal 此时根本不会打开，无需处理）。在 ResultsPage：即使 AI 报告缺失，仍允许导出（含元信息 + 特质摘要 + 得分），文档末尾提示「AI 报告未生成」。

**理由**：用户在 readonly 历史项中可能没有 AI 报告，此时仍应能导出基础摘要。

## Risks / Trade-offs

- **[失去 PDF 路径]** → Mitigation：在导出按钮 `title`/i18n 文案中说明「下载 Markdown 文件」，让用户知道点击预期；后续若需 PDF 可作为独立 capability 增量交付。
- **[Markdown 表格在某些查看器中渲染差]** → Mitigation：表格采用 GFM 语法（README 渲染、VSCode 预览、GitHub、Typora 都支持）；纯文本查看也仍可读。
- **[长报告大文件]** → 实测 AI 报告 ~5-15KB，浏览器 `Blob` + 同步下载完全可承受，无需流式处理。
- **[i18n 文档语言与系统语言不一致]** → 历史快照可能保存在英文环境、当前 UI 是中文。约定：导出时以 `entry?.language ?? i18n.language` 为准（与 ResultsPage 现有 `displayLanguage` 一致）。
- **[文件名碰撞]** → 同一天多次导出会覆盖（浏览器一般会自动加 `(1)`）。可接受，不引入时间戳避免噪声。

## Migration Plan

无数据迁移。代码层面：

1. 新增 `src/services/reportExport.ts`；
2. 替换 `ResultsPage.tsx:365` 与 `ReportReaderModal.tsx:83` 的 `onClick` 处理；
3. 调整/新增 i18n 文案（如 `results:exportHint`），不破坏既有 key；
4. 手工冒烟：中文/英文、深色/浅色、有/无 AI 报告、history 快照场景各导出一次，验证文件内容完整。

回滚：直接 revert PR 即可，无残留状态。

## Open Questions

- 导出文件是否需要包含「免责声明」或「来源」一段？暂定不加，避免污染用户文档；如有需求后续追加。
- 是否要在导出后给用户一个 toast 提示「已下载 xxx.md」？当前项目无 toast 组件，先保持浏览器原生下载提示；若用户反馈不直观再加。
