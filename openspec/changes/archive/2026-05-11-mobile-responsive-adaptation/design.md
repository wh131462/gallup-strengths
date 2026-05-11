## Context

代码库使用 React 19 + Vite + TailwindCSS v4。当前 UI 主要面向桌面端设计，组件中大量使用固定大间距（`p-12`/`p-20`/`py-16`）、超大字号（`text-8xl`/`text-9xl`）、横向多栏布局（`lg:w-3/5`、`md:flex-row`、`grid-cols-2`），仅在少数位置具备 `md:` 响应式前缀，移动端访问体验显著退化。

本次改动仅修改表现层（JSX className 与少量 HTML meta），不触及业务逻辑、数据模型、i18n 文案与 AI/历史/导出服务。

## Goals / Non-Goals

**Goals:**
- 在 360–414px 主流手机宽度下，所有核心流程（启动 → 选择长度 → 答题 → 结果 → 历史 → 设置）可用、无横向溢出、触摸友好。
- 在 ≥ 768px 视口下保持现有桌面端视觉零回归。
- 采用「移动优先」class 组织：基础值面向移动端，`sm:` / `md:` / `lg:` 前缀向上叠加。
- 改动局限于现有组件的 className 调整与极少量结构性 wrapper；不引入新组件、新依赖、新工具链。

**Non-Goals:**
- 不重新设计视觉风格、配色、字体族。
- 不引入移动端专属组件（如抽屉/底部 sheet）。
- 不做 PWA、离线、安装等能力扩展。
- 不针对横屏手机、折叠屏做特殊优化。
- 不修改 recharts/lucide/i18n 等依赖版本。

## Decisions

### D1：使用 Tailwind 默认断点，移动优先
- **选择**：保留 Tailwind v4 默认断点（`sm`/`md`/`lg`/`xl`），约定 base class 面向 ≤ 360px，断点前缀向上叠加。
- **理由**：项目已是 Tailwind v4，零成本；移动优先是 Tailwind 官方推荐范式，且向上叠加比向下覆盖更易回归。
- **替代**：自定义新断点（如 `xs: 360px`）—— 拒绝，理由是会引入不必要的约定成本与配置变更。

### D2：以 className 增量改写为主，避免结构性重构
- **选择**：尽量只在现有元素上追加 / 替换 className（如 `p-12` → `p-6 md:p-12`），仅在必要位置插入 `<div>` wrapper（如让图表容器在移动端独立设宽）。
- **理由**：最小化 diff、降低回归风险，符合 CLAUDE.md「surgical changes」要求。
- **替代**：抽出 `useBreakpoint` hook + 条件渲染 —— 拒绝，理由是 CSS 已足够，JS 方案徒增运行时与复杂度。

### D3：触摸目标统一 44px
- **选择**：可点击元素在移动端通过 `min-h-[44px] min-w-[44px]`（图标按钮）或自然 padding（文本按钮、选项卡）保证 ≥ 44 × 44px 命中区。
- **理由**：对齐 Apple HIG 与 WCAG 2.5.5 推荐尺寸。
- **替代**：48px（Material）—— 拒绝，理由是与现有视觉比例更兼容 44px。

### D4：模态框移动端近全屏，非全屏接管
- **选择**：`<sm` 时 `w-[95vw] max-h-[90vh]`，内部 `overflow-y-auto`，保留圆角与边距以维持卡片感。
- **替代**：完全全屏（`w-screen h-screen`）—— 拒绝，理由是会显著改变视觉语言，超出「适配」范畴。

### D5：recharts 通过 ResponsiveContainer + 条件高度
- **选择**：图表外层确保使用 `ResponsiveContainer`，外层容器在 `<md` 设定较小高度（如 `h-64 md:h-96`），并通过 Tailwind 控制坐标轴标签字号。
- **替代**：换轻量图表库 —— 拒绝，超出范围。

### D6：不修改 Tailwind 配置
- **选择**：不修改 `vite.config.ts`、不新增 Tailwind config 文件（项目使用 `@tailwindcss/vite` 插件，配置主要在 `index.css`）。
- **理由**：默认断点已够用，避免配置漂移。

## Risks / Trade-offs

- **风险**：大面积 className 改动可能误伤桌面端布局 → **缓解**：所有改动遵循「base 移动 + `md:` 恢复桌面原值」模式，且在 PR 前在 1280px / 1024px / 768px / 414px / 360px 五档目视检查。
- **风险**：recharts 在小尺寸下文字重叠 → **缓解**：减小 tick 字号、可在必要时缩短 label / 倾斜 X 轴标签。
- **风险**：长 i18n 文案（中英差异）在移动端撑破按钮 → **缓解**：按钮使用 `whitespace-normal` 或允许换行，避免 `whitespace-nowrap`。
- **风险**：触摸目标加大可能影响紧凑桌面布局 → **缓解**：`min-h/min-w` 仅在 base，桌面端通过 `md:min-h-0` 显式还原（按需）。

## Migration Plan

无数据迁移。改动随构建发布即生效。回滚策略：单次 PR 包含全部 className 改动，回滚即 `git revert`。

## Open Questions

- 是否需要为「分享卡片」/「PDF 导出」单独做移动端样式？当前假设导出仍以桌面尺寸渲染（导出场景不依赖屏幕宽度），如有不同请在实施前澄清。
