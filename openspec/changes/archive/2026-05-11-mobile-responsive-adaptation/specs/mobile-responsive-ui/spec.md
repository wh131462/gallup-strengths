## ADDED Requirements

### Requirement: 响应式断点策略
应用 SHALL 使用 TailwindCSS 默认断点体系（`sm`≥640px、`md`≥768px、`lg`≥1024px、`xl`≥1280px）作为唯一断点来源，所有页面与组件 MUST 以「移动优先」编写样式：基础类面向 ≤ 360px 起步，更大屏幕通过断点前缀叠加。

#### Scenario: 360px 视口无横向溢出
- **WHEN** 用户在宽度为 360px 的设备打开任意页面（Landing / LengthSelection / Quiz / Results / History）
- **THEN** 页面内容 MUST 不产生水平滚动条，所有文字、按钮、图表均完整可见于视口内

#### Scenario: 768px 与桌面端布局保持不变
- **WHEN** 视口 ≥ 768px
- **THEN** 各页面 MUST 呈现与本次改动前一致的桌面端布局（左右分栏、网格列数、字号阶梯）

### Requirement: 移动端排版令牌
在 `<sm` 视口下，页面级容器内边距 MUST 使用 `px-4`、`py-10` 量级；超大显示字号 MUST 提供阶梯回落（如 `text-4xl sm:text-6xl md:text-8xl`）；段落字号 MUST ≥ 14px 以保可读性。

#### Scenario: 移动端 LandingPage 标题不溢出
- **WHEN** 在 360px 视口打开 LandingPage
- **THEN** 主标题 MUST 在单行或自然换行后完整可见，且左右边距 ≥ 16px

#### Scenario: 移动端 ResultsPage 内边距收敛
- **WHEN** 在 < 768px 视口打开 ResultsPage 的报告卡片
- **THEN** 卡片容器内边距 MUST ≤ `p-6`（24px），且不出现 `p-12` / `p-20` 的桌面级留白

### Requirement: 触摸目标尺寸
所有可点击元素（按钮、题目选项、序号导航、模态框关闭按钮、语言切换、设置入口）在移动端 MUST 拥有最小 44 × 44 CSS 像素的命中区域。

#### Scenario: 答题选项可触摸
- **WHEN** 用户在移动端 QuizPage 点击李克特量表选项
- **THEN** 该选项的可点击区域 MUST ≥ 44 × 44px，且相邻选项之间存在视觉与命中间隔

#### Scenario: 工具栏图标按钮可触摸
- **WHEN** 用户在移动端点击顶部「语言切换」「主题切换」「设置」图标
- **THEN** 每个图标按钮的命中区域 MUST ≥ 44 × 44px

### Requirement: 多列布局在移动端堆叠
所有桌面端横向多栏布局（`flex-row` / `grid-cols-≥2` / `lg:w-X/Y`）在 `<md` 视口 MUST 退化为单列纵向堆叠，且子项顺序符合阅读逻辑（主内容在前、辅助信息在后）。

#### Scenario: ResultsPage 主报告区堆叠
- **WHEN** 视口 < 1024px
- **THEN** ResultsPage 的左右两栏（主优势叙述 / 侧边详情）MUST 纵向堆叠，左栏在上、右栏在下

#### Scenario: QuizPage 题目内容堆叠
- **WHEN** 视口 < 768px
- **THEN** QuizPage 的「题干 + 选项」横向布局 MUST 退化为纵向，题干在上、选项区在下

### Requirement: 模态框移动端展示
所有模态框（`SettingsModal` / `ConfirmDialog` / `ReportReaderModal`）在 `<sm` 视口 MUST 采用接近全屏布局（宽度 ≥ 92vw、最大高度 ≤ 90vh）且内容区可纵向滚动；关闭按钮 MUST 始终可见。

#### Scenario: 设置模态框在移动端可滚动
- **WHEN** 用户在 360 × 640 视口打开 SettingsModal
- **THEN** 模态框 MUST 占据 ≥ 92vw 宽度，内容超出时 MUST 出现纵向滚动条且关闭按钮固定可访问

#### Scenario: 报告阅读器模态框移动端
- **WHEN** 用户在移动端打开 ReportReaderModal
- **THEN** Markdown 内容 MUST 不产生横向溢出，代码块/表格 MUST 在自身容器内横向滚动而非撑开页面

### Requirement: 图表移动端适配
ResultsPage 中 recharts 图表在 `<md` 视口 MUST 缩减高度、坐标轴字号与外边距，以保证 360px 视口下完整渲染且不溢出。

#### Scenario: 图表在移动端完整渲染
- **WHEN** 用户在 360px 视口查看 ResultsPage 的可视化图表
- **THEN** 图表 MUST 完整呈现在父容器内，坐标轴标签可读（字号 ≥ 10px），且不被裁切

### Requirement: Viewport 配置
`index.html` MUST 包含 `<meta name="viewport" content="width=device-width, initial-scale=1" />`，以禁用移动浏览器的默认缩放并确保 CSS 像素映射正确。

#### Scenario: viewport 标签存在
- **WHEN** 构建产物加载到移动浏览器
- **THEN** 文档 `<head>` MUST 含有上述 viewport meta 标签
