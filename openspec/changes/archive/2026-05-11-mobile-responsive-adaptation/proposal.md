## Why

当前应用在移动端（手机/平板竖屏）下存在显著体验问题：固定大间距（如 `p-12`、`p-20`）、超大字号（如 `text-8xl/9xl`）、横向布局未压缩、按钮和图表在小屏溢出或难以触摸操作。用户在移动设备访问时排版破碎、内容被截断、滚动体验差，影响测评的可用性与可信度。

## What Changes

- 为所有页面与组件补齐响应式断点（`sm` / `md` / `lg`），确保 360px – 768px 屏幕下排版合理、无横向溢出。
- 调整页面级排版令牌：外边距 `px-6` → `px-4 sm:px-6`、纵向 `py-16` → `py-10 sm:py-16`；超大标题字号增加 `text-4xl sm:text-6xl md:text-8xl` 等阶梯。
- 重构 `ResultsPage` 的左右两栏（`lg:w-3/5 / lg:w-2/5`）在移动端堆叠，并降低 `p-12` 内边距、压缩字号、调整图表（recharts）的高度与字体。
- 重构 `QuizPage` 题目卡片：选项区在 `<md` 改为纵向堆叠，序号导航在小屏紧凑或可横向滚动，触摸点击区域 ≥ 44px。
- 调整 `LandingPage` 网格（`grid-cols-2`）字号、间距，避免移动端文字溢出；按钮在小屏全宽。
- 模态框（`SettingsModal` / `ConfirmDialog` / `ReportReaderModal`）在移动端使用近全屏宽度（如 `w-[95vw] max-w-...`），并保证可滚动。
- 顶部工具栏（语言切换、主题切换、设置）在移动端紧凑展示。
- 添加 viewport meta 校验（`index.html`）确保正确缩放。
- 添加移动端样式规范的轻量文档（在 spec 中）。

不涉及业务逻辑、不引入新依赖。

## Capabilities

### New Capabilities
- `mobile-responsive-ui`: 定义全应用的响应式断点策略、移动端排版令牌、触摸目标尺寸、模态框与图表在移动端的行为约束。

### Modified Capabilities
（无 — 现有 spec 均为业务/功能能力，本次仅在 UI 表现层叠加响应式约束，不修改其需求语义。）

## Impact

- 受影响代码：`index.html`、`src/App.tsx`、`src/components/*.tsx`（主要为 `LandingPage`、`LengthSelectionPage`、`QuizPage`、`ResultsPage`、`HistoryList`、`SettingsModal`、`ConfirmDialog`、`ReportReaderModal`、`LanguageSwitcher`）。
- 不影响：API、数据结构、i18n 文案、题库、AI 配置、CI 流程。
- 依赖：无新增依赖；继续使用现有 TailwindCSS v4。
- 风险：可能影响桌面端既有视觉（通过仅在 `<md` 处添加规则、桌面端保留原 class，规避回归）。
