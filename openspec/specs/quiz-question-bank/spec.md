# Quiz Question Bank Specification

## Purpose

The `quiz-question-bank` capability provides the single source of truth for assessment items used by the Strengths Navigator quiz: question structure, version metadata, length-tiered subset sampling, and content-source provenance. It decouples question authoring from UI/runtime code, enables multiple quiz lengths to share one curated dataset, and records the bank version against every saved history entry so prior results stay interpretable across content updates.

## Requirements

### Requirement: 题目库结构化定义

题目库 SHALL 在 `src/data/questionBank.ts` 中以单一来源（single source of truth）形式提供，包含元数据（版本、来源、更新时间）与题目数组。题目结构 SHALL 在 `Question` 基础上扩展 `tags: string[]`、`source: string`、`difficulty?: 'easy' | 'standard' | 'deep'` 三个可选字段；题面文本仍由 i18n（`strengths.json` 的 `questions.<id>.statementA/B`）按 `id` 提供，题库本体只承载结构与元数据。

#### Scenario: 加载题库元数据

- **WHEN** 应用初始化或测试代码读取 `getQuestionBank()`
- **THEN** 返回值 MUST 包含 `version`（语义化版本字符串）、`generatedAt`（ISO 时间）、`questions`（数组，长度 ≥ 100），且每条 `question` MUST 同时具备 `id / domainA / domainB / themesA / themesB / tags / source` 字段

#### Scenario: 题面文本来自 i18n

- **WHEN** UI 需要展示某题（如 `id = "42"`）
- **THEN** 题面文本 MUST 通过 `t('strengths:questions.42.statementA')` 与 `t('strengths:questions.42.statementB')` 取得，题库结构本身 MUST NOT 内联中英文文本

### Requirement: 题目库版本管理

题库 SHALL 携带语义化版本号 `version: string`，并在每次正文/数量变更时递增。`HistoryEntry.questionBankVersion` SHALL 记录该次测评所用题库版本，便于跨版本审阅历史结果。

#### Scenario: 历史条目记录题库版本

- **WHEN** 用户完成一次测评并写入历史
- **THEN** 新写入的 `HistoryEntry` MUST 包含 `questionBankVersion`，其值等于当时 `getQuestionBank().version`

#### Scenario: 旧历史条目兼容

- **WHEN** 读取早于本次变更生成的历史条目（缺失 `questionBankVersion` 字段）
- **THEN** 服务层 MUST 将该字段视作 `"legacy"`，且 UI MUST 正常展示该条目，不抛出异常

### Requirement: 题目档位与子集采样

题库 SHALL 提供三档预设：`quick`（30 题）、`standard`（60 题）、`deep`（100 题，全题库）。`getQuestionsForLength(length)` 函数 SHALL 在以下约束下返回子集：

1. 子集内每对四大领域配对（共 6 种 domain 配对：E-I、E-R、E-S、I-R、I-S、R-S）的题目数量 SHALL 在 `floor(length/6)` 与 `ceil(length/6)` 之间，确保配对均衡。
2. 子集 SHALL 使用稳定的题目 id 排序（按数字升序），同一档位每次返回的题目集合 MUST 完全一致（确定性）。
3. `deep` 档 SHALL 直接返回全题库。

#### Scenario: Quick 档返回 30 题且配对均衡

- **WHEN** 调用 `getQuestionsForLength('quick')`
- **THEN** 返回数组长度 MUST 等于 30，且按 `domainA-domainB` 分组后，每组数量 MUST 在 4 到 6 之间（30 / 6 = 5）

#### Scenario: 同一档位结果稳定

- **WHEN** 在同一题库版本下两次调用 `getQuestionsForLength('standard')`
- **THEN** 两次返回的题目 id 序列 MUST 完全相同

#### Scenario: Deep 档返回完整题库

- **WHEN** 调用 `getQuestionsForLength('deep')`
- **THEN** 返回数组长度 MUST 等于 `getQuestionBank().questions.length`（即 100）

### Requirement: 题目内容来源与许可标注

题库每个题目 SHALL 在 `source` 字段中以简短标识标记其原始参考来源（例如 `"public-pair-style"`、`"adapted-from-original-pair"` 或 `"author-original"`），并在仓库中提供来源清单与重写原则文档（首次落地于 `openspec/changes/archive/<date>-optimize-quiz-question-flow/SOURCES.md`）。题面文本 MUST 为重新撰写的对比表述，不得整段复制受版权保护的官方题目原文。

#### Scenario: 题目带可追溯来源

- **WHEN** 审阅 `questionBank.questions` 中任一项
- **THEN** 该项 MUST 具有非空 `source` 字符串，且其值 MUST 出现在 `ALLOWED_QUESTION_SOURCES` 枚举中

#### Scenario: 不复制受版权保护原文

- **WHEN** 校验脚本（或人工审查）扫描 `strengths.json` 中所有题面
- **THEN** 任意 `statementA` 或 `statementB` MUST NOT 与已知官方 CliftonStrengths 题面逐字一致；如检测到嫌疑，CI/审查 MUST 标记该题为待修订

### Requirement: 题面 i18n 完整性

`strengths.json`（中英）SHALL 为题库中每一道题目提供 `questions.<id>.statementA` 与 `questions.<id>.statementB` 文案。CI 校验脚本 SHALL 在缺失任一题面时报错。

#### Scenario: i18n 校验通过

- **WHEN** 运行 `node scripts/check-i18n.mjs`
- **THEN** 脚本 MUST 校验 `strengths.json` 的 `questions` 覆盖 `getQuestionBank().questions` 全部 id；任一缺失 MUST 以非零退出码失败

#### Scenario: 新增题目同步加文案

- **WHEN** 题库新增一道 id 为 `101` 的题目而 `strengths.json` 未补齐
- **THEN** CI 校验 MUST 失败，错误信息 MUST 指出缺失的具体 key
