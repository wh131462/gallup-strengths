## Context

顾问报告由 `src/services/aiService.ts` 调用大模型生成，返回的是 Markdown 文本（标题、粗体、列表、引用、表格等）。当前 `ResultsPage.tsx` 的渲染方式：

- 顾问视角卡片：`aiReport?.substring(0, 300) + '...'`，纯文本直接展示，Markdown 记号暴露
- Full Synthesis Report 区块：`<div className="whitespace-pre-wrap">{aiReport}</div>`，同样无渲染

结果：用户看到的是 `## 你的核心主题\n\n**包容** 让你...`。产品定位为专业、克制的 editorial 风格（`prose-headings:font-serif prose-headings:italic`），原始 Markdown 与此严重冲突。

项目栈：React 19 + Vite 6 + Tailwind 4 + motion（动效）+ react-i18next。已有 `SettingsModal` 作为弹窗组件参考。不使用 `@tailwindcss/typography` 插件（Tailwind 4 对 prose 类已通过手写样式覆盖）。

## Goals / Non-Goals

**Goals:**
- 在顾问视角卡片、完整报告区域、阅读弹窗三处统一使用 Markdown 渲染
- 提供「专注阅读」的全屏 / 大尺寸弹窗，让用户在一个独立空间完整浏览报告
- 样式与现有 editorial 风格一致（serif 标题、light 正文、深色模式支持）
- 安全：不允许 AI 输出的任意 HTML 执行（防御性，即便当前模型不太会返回 HTML）

**Non-Goals:**
- 不引入富文本编辑能力
- 不支持 Mermaid / KaTeX 等扩展语法（GFM 足够）
- 不改变 AI prompt 或报告内容结构
- 不改变导出/打印逻辑（继续使用 `window.print`）
- 不做 TOC、锚点跳转、段落折叠等高级阅读器功能

## Decisions

### 1. Markdown 库选型：`react-markdown` + `remark-gfm`

- `react-markdown` 是 React 生态主流、轻量、按 AST 渲染（不注入 `innerHTML`），天然防 XSS
- `remark-gfm` 提供 GitHub Flavored Markdown（表格、删除线、任务列表、自动链接）
- 替代方案：
  - `markdown-it` + 手动 React 包装：需要 `dangerouslySetInnerHTML`，安全面更大
  - `marked` + `DOMPurify`：需要额外清洗库，体积更大
  - MDX：支持 JSX，但 AI 输出的是 Markdown 而非 MDX，能力过剩

### 2. 统一 `<MarkdownRenderer />` 组件

位置：`src/components/MarkdownRenderer.tsx`

职责：
- 封装 `ReactMarkdown` + `remarkGfm`
- 通过 `components` prop 覆盖 `h1/h2/h3/p/ul/ol/blockquote/code/table/a` 的样式，使其贴合 editorial 设计
- 接受 `children: string`（Markdown 源文本）与可选 `variant: 'card' | 'reader'`（控制字号/间距差异）
- 不渲染原始 HTML（`react-markdown` 默认即 disable raw HTML，无需 rehype-raw）

三处调用点：
- 顾问视角卡片预览：传入截断后的 Markdown（见决策 5）
- Full Synthesis Report 区块：传入完整 `aiReport`
- Reading Modal：传入完整 `aiReport`

### 3. 阅读弹窗 `<ReportReaderModal />`

位置：`src/components/ReportReaderModal.tsx`

结构：
- Portal 到 `document.body`（避免被父级 transform/overflow 裁剪）
- 背景遮罩（`bg-black/60 backdrop-blur-sm`），点击关闭
- 容器：`max-w-3xl`，`max-h-[90vh]`，`overflow-y-auto`，居中
- Header：标题（`t('results:fullReport')`）+ 关闭按钮（X 图标）
- Body：`<MarkdownRenderer variant="reader">`
- Footer：导出 PDF（调 `window.print`）+ 关闭
- 交互：
  - ESC 关闭（`useEffect` 上 `keydown` 监听）
  - 打开时禁用 body 滚动（`document.body.style.overflow = 'hidden'`）
  - 关闭时恢复
- 动效：复用 `motion/react`，淡入 + 轻微缩放，与 `SettingsModal` 风格一致

### 4. 顾问视角卡片改造

替换当前 `<div>{aiReport?.substring(0, 300)}...</div>`：
- 使用 `<MarkdownRenderer variant="card">` 渲染截断后的 Markdown 文本
- 卡片下方新增「阅读完整报告」按钮（样式与现有按钮体系一致：`uppercase tracking-[0.2em]`）
- 点击按钮 → `setReaderOpen(true)`

### 5. 预览文本截断策略

不能简单 `substring(0, 300)` —— 可能切断 Markdown 语法（例：`**包容**` 被截成 `**包`）导致渲染异常。策略：
- 按段落（`\n\n` 分隔）累积字符，超过约 300 字符时停止
- 末尾追加省略号（另起一段 `\n\n…`）
- 该逻辑作为 `MarkdownRenderer` 的 `maxChars` prop 或在 `ResultsPage` 内实现小工具函数（倾向后者，保持组件纯粹）

### 6. Full Synthesis Report 区块的处置

保留该区块，但内部由 `whitespace-pre-wrap` 纯文本替换为 `<MarkdownRenderer variant="reader">`。
理由：
- 不破坏打印/导出流程（`window.print` 依赖页面正文结构）
- 弹窗是「专注阅读」的增量能力，不要求替代页面常驻报告

### 7. 样式与深色模式

在 `MarkdownRenderer` 的 components 映射中逐元素应用 Tailwind 类：
- `h1/h2/h3`: `font-serif italic font-light text-zinc-900 dark:text-white` + 不同 `text-*` 尺寸
- `p`: `text-zinc-700 dark:text-zinc-300 font-light leading-loose`
- `strong`: `font-medium text-zinc-900 dark:text-white`
- `ul/ol`: `list-disc/list-decimal pl-6 space-y-2`
- `blockquote`: `border-l-2 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400`
- `code`（inline）：`font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded`
- `pre code`：块级代码，`overflow-x-auto`
- `table`: 简洁边框 + `text-sm`
- `a`: `underline underline-offset-4 hover:text-zinc-900 dark:hover:text-white`，`target="_blank" rel="noopener noreferrer"`

`variant='card'` 缩小字号并压缩间距；`variant='reader'` 使用更大字号与更宽松行距。

### 8. 依赖版本

- `react-markdown`: `^9.x`（兼容 React 18/19）
- `remark-gfm`: `^4.x`

通过 `npm install react-markdown remark-gfm` 添加；不引入 `rehype-raw`（保持 HTML 过滤）。

### 9. i18n 新增 key（`results.json`）

- `openReader`: 打开阅读器 / Read full report
- `closeReader`: 关闭 / Close
- `readerTitle`: 顾问完整报告 / Advisor Full Report（可复用 `fullReport`）

## Risks / Trade-offs

- [`react-markdown` 包体积增加（~50KB gzipped）] → 影响可接受；相对于整站功能价值合理；Vite 已 tree-shake
- [Markdown 渲染差异：AI 输出的 Markdown 可能包含非预期元素（HTML、裸 URL）] → 默认不渲染 raw HTML；裸 URL 交给 `remark-gfm` 自动链接化
- [截断 Markdown 的边界情况（表格被切半、列表项不完整）] → 段落级截断 + 省略号降低风险；极端情况在预览里短暂显示「不美观」，但不会破坏渲染
- [弹窗 Portal 的深色模式样式可能与页面根不同步] → 通过 Tailwind `dark:` 类继承，验证时检查
- [打印时弹窗是否遮挡页面] → 弹窗使用 `print:hidden`；打印仅使用页面常驻 Full Report 区块
- [键盘可访问性] → `role="dialog"`、`aria-modal="true"`、`aria-labelledby`；关闭按钮可聚焦；ESC 关闭

## Migration Plan

纯增量改动，无破坏性变更：
1. 安装依赖
2. 实现 `MarkdownRenderer` 与 `ReportReaderModal`
3. 替换 `ResultsPage` 的三处渲染 + 接入按钮
4. 新增 i18n 文案
5. 本地 `npm run build` + `npm run lint` 通过
6. 浏览器自检：浅色 / 深色 / 打印 / ESC 关闭 / 移动端尺寸

回滚：还原 `ResultsPage.tsx` 中的渲染片段即可，两个新组件可保留不引用。

## Open Questions

- 是否需要在弹窗内提供「复制全文」按钮（复制纯 Markdown）？默认倾向**不加**，减少首版范围；若用户反馈需要再增
- Full Synthesis Report 区块在弹窗上线后是否冗余？默认**保留**以兼容打印与 SEO-like 的线性阅读；若后续体验重复再决定移除
