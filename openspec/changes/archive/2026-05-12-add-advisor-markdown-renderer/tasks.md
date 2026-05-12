## 1. Dependencies & Scaffolding

- [x] 1.1 在 `package.json` 增加 `react-markdown@^9` 和 `remark-gfm@^4`，运行 `npm install`
- [x] 1.2 `npm run lint` 与 `npm run build` 验证依赖接入无回归

## 2. MarkdownRenderer 组件

- [x] 2.1 新建 `src/components/MarkdownRenderer.tsx`，封装 `ReactMarkdown` + `remarkGfm`
- [x] 2.2 实现 `variant: 'card' | 'reader'` 切换字号/行距
- [x] 2.3 通过 `components` prop 覆盖 `h1/h2/h3/p/strong/em/ul/ol/li/blockquote/code/pre/table/thead/tbody/tr/th/td/a/hr` 的 Tailwind 样式，对齐现有 editorial 风格
- [x] 2.4 深色模式样式核对（`dark:` 类全覆盖）
- [x] 2.5 外链处理：`a` 标签默认 `target="_blank" rel="noopener noreferrer"`
- [x] 2.6 确认默认不渲染 raw HTML（不引入 `rehype-raw`）；编写一小段手动测试 Markdown 串（含 `<script>`）确认被忽略或以纯文本显示

## 3. 预览截断工具

- [x] 3.1 在 `src/components/ResultsPage.tsx`（或同目录 util）实现 `truncateMarkdown(text: string, maxChars: number): string`，按 `\n\n` 段落边界截断并追加省略号
- [x] 3.2 确保截断结果不会落在未闭合的 `**`、`*`、`` ` ``、列表行内部

## 4. ReportReaderModal 组件

- [x] 4.1 新建 `src/components/ReportReaderModal.tsx`
- [x] 4.2 使用 `createPortal` 挂载到 `document.body`
- [x] 4.3 背景遮罩 + 点击关闭；`max-w-3xl`、`max-h-[90vh]`、内部 `overflow-y-auto`
- [x] 4.4 Header：标题 + 关闭按钮（`X` 图标来自 `lucide-react`）
- [x] 4.5 Body：渲染 `<MarkdownRenderer variant="reader">{report}`
- [x] 4.6 Footer：导出 PDF 按钮（调 `window.print`）+ 关闭按钮
- [x] 4.7 ESC 关闭：`useEffect` 监听 `keydown`，并在卸载时清理
- [x] 4.8 打开时 `document.body.style.overflow = 'hidden'`，关闭 / 卸载恢复为原值
- [x] 4.9 无障碍：`role="dialog"`、`aria-modal="true"`、`aria-labelledby` 关联 Header 标题 id
- [x] 4.10 动效：使用 `motion/react` 做淡入 + 轻微缩放，风格贴近 `SettingsModal`
- [x] 4.11 添加 `print:hidden` 让弹窗不进入打印输出

## 5. ResultsPage 接入

- [x] 5.1 用 `<MarkdownRenderer variant="card">{truncateMarkdown(aiReport, 300)}` 替换顾问视角卡片中的 `aiReport?.substring(0, 300)` 分支
- [x] 5.2 在顾问视角卡片按钮区（或替代原 ellipsis 下方）新增「阅读完整报告」按钮，点击 `setReaderOpen(true)`
- [x] 5.3 在 loading / needsConfig / reportError 状态下隐藏或禁用「阅读完整报告」按钮
- [x] 5.4 用 `<MarkdownRenderer variant="reader">{aiReport}` 替换「Full AI Report Body」中的 `whitespace-pre-wrap` 渲染
- [x] 5.5 在组件底部挂载 `<ReportReaderModal open={readerOpen} report={aiReport} onClose={...} />`
- [x] 5.6 清理不再需要的内联样式/逻辑（保持最小改动）

## 6. i18n

- [x] 6.1 在 `src/i18n/locales/zh/results.json` 新增：`openReader`（例：「阅读完整报告」）、`closeReader`（「关闭」）、`readerTitle`（可复用 `fullReport` 或新增）、`copyReport`（若实施复制按钮则加，否则省略）
- [x] 6.2 在 `src/i18n/locales/en/results.json` 新增对应英文文案
- [x] 6.3 在 `ReportReaderModal` 与 `ResultsPage` 中通过 `t('results:...')` 引用新 key
- [x] 6.4 运行 `npm run check-i18n` 确认无缺失

## 7. 验证

- [x] 7.1 `npm run lint`（`tsc --noEmit`）通过
- [x] 7.2 `npm run build` 通过
- [ ] 7.3 `npm run dev` 手动验证（留给用户在浏览器中完成）：
  - 顾问视角卡片 Markdown 预览正确渲染（标题、粗体、列表）
  - 「阅读完整报告」按钮打开弹窗，内容完整且格式正确
  - ESC / 背景点击 / 关闭按钮均能关闭弹窗
  - 弹窗打开时页面无法滚动，关闭后恢复
  - 浅色 / 深色模式下样式一致
  - 移动端宽度下弹窗可正常滚动阅读
  - `window.print` 输出仅包含页面常驻报告区域，不含弹窗
- [x] 7.4 人工构造含 `<script>` 的 Markdown 字符串，确认无脚本执行
