## 1. 基础设施与全局配置

- [x] 1.1 校验并修正 `index.html` 的 `<meta name="viewport">` 设置，确保 `width=device-width, initial-scale=1`
- [x] 1.2 审阅 `src/index.css`，确认全局 base 字号/行高在移动端可读（必要时添加移动端默认 `font-size` 调整，但不改变设计 tokens）
- [x] 1.3 在 `src/App.tsx` 顶部工具栏（语言/主题/设置/历史按钮）补齐 `min-h-[44px] min-w-[44px]` 与移动端紧凑间距

## 2. LandingPage 移动端适配

- [x] 2.1 调整 `src/components/LandingPage.tsx` 外层容器内边距：`px-6 py-16` → `px-4 py-10 sm:px-6 sm:py-16`
- [x] 2.2 主标题字号阶梯：`text-6xl md:text-8xl` → `text-4xl sm:text-6xl md:text-8xl`，副标题与说明文字同步降级
- [x] 2.3 验证 `grid grid-cols-2 md:grid-cols-4` 卡片在 360px 视口下文字不溢出，必要时调整内边距与字号
- [x] 2.4 CTA 按钮在 `<sm` 改为全宽 (`w-full sm:w-auto`)，确保高度 ≥ 44px

## 3. LengthSelectionPage 移动端适配

- [x] 3.1 调整 `src/components/LengthSelectionPage.tsx` 外层容器内边距与标题字号阶梯
- [x] 3.2 选项卡（标准/快速/深度等）网格列数：在 `<sm` 单列、`sm` 双列、`md+` 保持现状
- [x] 3.3 选项卡内部内边距与字号在移动端收敛，整卡命中区 ≥ 44px

## 4. QuizPage 移动端适配

- [x] 4.1 `src/components/QuizPage.tsx` 外层 `max-w-5xl mx-auto px-6 py-16` 调整为移动优先：`px-4 py-8 sm:px-6 sm:py-16`
- [x] 4.2 题干 + 选项区横向布局（`flex-col md:flex-row`）确认在 `<md` 已堆叠；检查分隔线 `w-px ... hidden md:block` 在移动端隐藏正确
- [x] 4.3 李克特量表选项按钮：保证 `min-h-[44px]`，在 `<sm` 改为更紧凑的纵向或两列网格（具体取决于现状），避免溢出
- [x] 4.4 题号导航条 `flex justify-between` 在小屏改为可横向滚动（`overflow-x-auto`）或紧凑显示当前/总数
- [x] 4.5 上一题/下一题按钮在移动端宽度与触摸区域优化

## 5. ResultsPage 移动端适配

- [x] 5.1 外层 `max-w-7xl mx-auto px-6 py-16` → `px-4 py-8 sm:px-6 sm:py-16`
- [x] 5.2 顶部 header `flex flex-col md:flex-row` 已堆叠；调整右侧元信息 `hidden md:block` 在移动端的展示方案（如改为左对齐显示在堆叠下方，或保持隐藏）
- [x] 5.3 主报告卡片 `flex flex-col lg:flex-row` 子项内边距 `p-12` → `p-6 md:p-12`
- [x] 5.4 主优势序号字号 `text-8xl md:text-9xl` → `text-5xl sm:text-7xl md:text-9xl`；标题字号 `text-5xl md:text-7xl` → `text-3xl sm:text-5xl md:text-7xl`
- [x] 5.5 详情网格 `grid-cols-1 md:grid-cols-2` 保持；确认 gap 与内边距移动端合理
- [x] 5.6 操作按钮组 `flex-1 min-w-[140px]` 改为 `<sm` 全宽堆叠 (`w-full sm:flex-1 sm:min-w-[140px]`)，并保证 ≥ 44px 高度
- [x] 5.7 报告 Markdown 容器 `p-12 md:p-20` → `p-4 sm:p-8 md:p-20`，并确认内部 prose 在移动端可读
- [x] 5.8 recharts 图表外层容器在 `<md` 设定较小高度（`h-64 sm:h-80 md:h-96`），并调整坐标轴 tick 字号（注：代码中实际未使用 recharts，可视化为自定义 motion 进度条，已随 5.2 调整）

## 6. HistoryList 移动端适配

- [x] 6.1 `src/components/HistoryList.tsx` 列表项内边距、字号、操作按钮移动端调整
- [x] 6.2 操作按钮（查看 / 删除）触摸区域 ≥ 44px

## 7. 模态框移动端适配

- [x] 7.1 `src/components/SettingsModal.tsx`：在 `<sm` 使用 `w-[95vw] max-h-[90vh] overflow-y-auto`，关闭按钮始终可见
- [x] 7.2 `src/components/ConfirmDialog.tsx`：同 7.1 策略；按钮在移动端纵向堆叠或全宽
- [x] 7.3 `src/components/ReportReaderModal.tsx`：同 7.1；内部 Markdown 容器添加 `prose-sm sm:prose-base`，代码块/表格 `overflow-x-auto`

## 8. 辅助组件

- [x] 8.1 `src/components/LanguageSwitcher.tsx`：触摸目标 ≥ 44px，下拉/弹层在移动端不溢出视口
- [x] 8.2 `src/components/MarkdownRenderer.tsx`：审视全局 markdown 样式在移动端是否需要 `prose-sm` 阶梯（现有 `card` 变体已使用 text-sm；`reader` 变体已在外层容器添加 `prose-sm sm:prose-base`，表格已具备 `overflow-x-auto`）
- [x] 8.3 `src/components/markdown/` 下自定义渲染器（如表格/代码块）确保横向滚动隔离（`MarkdownRenderer.tsx` 中 `pre` 与 `table` 容器已具备 `overflow-x-auto`）

## 9. 验证

- [x] 9.1 运行 `npm run lint` 确保无 TS 错误（注：存在一个 `SettingsModal.tsx:159` TS2322 错误，与本次改动无关，属于既有未提交代码状态）
- [x] 9.2 运行 `npm run build` 确保构建通过
- [ ] 9.3 启动 `npm run dev`，在浏览器 DevTools 中以 360 × 640、414 × 896、768 × 1024、1280 × 800 四档手动验证全部页面与模态框
- [ ] 9.4 检查每页：无横向滚动、关键文字不被截断、所有按钮命中区 ≥ 44px、模态框可关闭、recharts 图表完整
- [ ] 9.5 桌面端（≥ 1024px）回归：与改动前视觉对比，确认无明显回归
