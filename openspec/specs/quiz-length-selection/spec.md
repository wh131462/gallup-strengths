# Quiz Length Selection Specification

## Purpose

The `quiz-length-selection` capability lets users pick how long their assessment will be before answering any questions. It introduces a dedicated step between Landing and Quiz, exposes three balanced length tiers (quick / standard / deep), and propagates the chosen tier into the quiz runtime, results page, and saved history so users can trade completion time against precision without losing interpretability of past results.

## Requirements

### Requirement: 长度选择页流程

应用 SHALL 在 `Landing` 与 `Quiz` 之间引入一个独立步骤 `LengthSelection`。用户在 Landing 点击「开始测评」时，应用 MUST 进入 `LengthSelection` 而非直接进入第一题。

#### Scenario: Landing 跳转到长度选择

- **WHEN** 用户在 Landing 点击「Begin Assessment」按钮
- **THEN** 应用 MUST 切换到 `LengthSelection` 视图，且当前 URL/状态 MUST 反映该步骤

#### Scenario: 用户可从长度选择返回

- **WHEN** 用户在 `LengthSelection` 点击「返回」或浏览器后退
- **THEN** 应用 MUST 回到 `Landing`，不写入任何答题状态

### Requirement: 三档长度选项展示

`LengthSelection` 页面 SHALL 展示三个选项：`quick`（30 题，预计 3–5 分钟）、`standard`（60 题，预计 6–10 分钟，推荐档）、`deep`（100 题，预计 10–15 分钟，最精准）。每个选项 MUST 显示题目数量、预计耗时、简短适用场景描述（来自 i18n）。`standard` MUST 标注为「推荐」。

#### Scenario: 默认推荐 standard

- **WHEN** 用户首次进入 `LengthSelection`
- **THEN** `standard` 选项 MUST 视觉上突出（如带「Recommended」徽章），且为键盘焦点首选项

#### Scenario: 三档信息齐全

- **WHEN** 渲染 `LengthSelection`
- **THEN** 每张选项卡 MUST 同时呈现：题目数量、预计耗时区间、一句话适用场景；缺失任一字段 MUST 在开发期校验中报错

### Requirement: 选定长度并进入测评

用户选定一档后，应用 SHALL 调用 `getQuestionsForLength(length)` 取出对应题目子集，并将其作为 props 传入 `QuizPage`。`QuizPage` MUST 使用该子集的长度作为 `totalSteps`，进度条与「第 X / Y 题」展示 MUST 反映实际题数（非固定 100）。

#### Scenario: 选 Quick 进入 30 题流程

- **WHEN** 用户在 `LengthSelection` 选择 `quick` 并点击「开始」
- **THEN** 应用 MUST 进入 `Quiz`，进度文案 MUST 显示「1 / 30」，且 `totalSteps === 30`

#### Scenario: 选 Deep 进入完整题库

- **WHEN** 用户选择 `deep` 并点击「开始」
- **THEN** `Quiz` MUST 渲染完整 100 题，进度起始为「1 / 100」

### Requirement: 长度信息持久化到历史

完成测评后，写入历史的 `HistoryEntry` SHALL 包含 `quizLength: number`（实际题数）。历史列表 UI MUST 在每条目上展示该数字（如 `30 题` / `60 题` / `100 题`）。

#### Scenario: 历史条目带题数

- **WHEN** 用户完成 60 题测评并保存
- **THEN** 新增的 `HistoryEntry` MUST 满足 `quizLength === 60`，历史列表对应行 MUST 显示「60 题」字样（i18n 后即可）

#### Scenario: 旧历史条目题数回填

- **WHEN** 读取早于本变更生成的历史条目（无 `quizLength` 字段）
- **THEN** 服务层 MUST 用 `Object.keys(entry.answers).length` 作为回填值，UI MUST 正常显示该回填数字

### Requirement: 长度选择的可访问性

`LengthSelection` 选项 SHALL 实现为可键盘导航的 `radiogroup`：方向键切换焦点、Enter/Space 选中、Tab 移到「开始」按钮。每张选项卡 MUST 提供 `aria-label`，标注题数与预计耗时。

#### Scenario: 键盘可完成长度选择

- **WHEN** 用户仅使用键盘进入 `LengthSelection`，按 ↓ 两次到 `deep`，按 Enter，再 Tab 到「开始」按钮按 Enter
- **THEN** 应用 MUST 进入 100 题的 `Quiz`，全程无需鼠标

#### Scenario: 屏幕阅读器可读

- **WHEN** 屏幕阅读器聚焦到任一选项卡
- **THEN** 朗读结果 MUST 包含档位名称、题目数量、预计耗时（语义来自 `aria-label` 或可见文本）

### Requirement: i18n 文案

新增命名空间 `lengthSelection` SHALL 在中英两个 locales 下提供：标题、副标题、三档名称、三档描述、推荐标签、开始按钮、返回按钮文案。Landing 既有 `landing.begin` 行为含义不变（仍是进入测评），仅跳转目标改为 `LengthSelection`，文案 MAY 保留或微调。

#### Scenario: 切换语言文案完整

- **WHEN** 用户切换到英文（或中文）后进入 `LengthSelection`
- **THEN** 页面所有可见文本 MUST 来自对应 locale，无 `lengthSelection.xxx` 这类裸 key 漏出
