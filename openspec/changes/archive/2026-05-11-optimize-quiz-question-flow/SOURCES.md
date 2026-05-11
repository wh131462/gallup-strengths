# 题目来源与重写原则

本文档说明本仓库 `src/data/questionBank.ts` 中题目对比对的来源分类、重写原则与许可注意事项，对应 spec：`openspec/changes/optimize-quiz-question-flow/specs/quiz-question-bank/spec.md`。

## 1. 背景

盖洛普 CliftonStrengths（前称 StrengthsFinder）官方题库受版权保护，**不得逐字复制原文**。本应用为非商业开源教育项目，采用「研究公开的 forced-choice pair 风格 → 自行重写题面 → 标注来源」的策略，在保留测评信度的同时规避版权风险。

## 2. 来源分类（`source` 枚举）

题库中每一道题的 `source` 字段必须落入下列之一（由 `src/types.ts` 的 `ALLOWED_QUESTION_SOURCES` 强制约束，CI 也会校验）：

| 值 | 含义 |
| --- | --- |
| `public-pair-style` | 题面结构与公开的 forced-choice 心理测评样题（如学术论文、公开教学资料中给出的示例题）一致，**经独立改写后形成**。 |
| `adapted-from-original-pair` | 题面思路改编自 34 主题之间的常见对比情境（如「成就 vs 行动」），**用原创表述**呈现，未引用任何受版权保护原文。 |
| `author-original` | 题面完全由维护者基于主题描述自行撰写，无任何外部参考依据。 |

> 当前 v1.0.0 版本所有 100 道题统一标记为 `adapted-from-original-pair`：题目骨架（domain/themes 配对）来自既有维护历史的常见 34-主题对比，题面文本由维护者用中英文重新表述。未来若新增题目，请按真实来源选择最贴近的枚举值。

## 3. 重写原则

新增或修订题面时遵循：

1. **不复制原文**：禁止逐字（或仅做同义替换式）使用官方题面。
2. **保留对比结构**：题面采用「我倾向 X / 我倾向 Y」两条独立陈述，避免单题混合多主题。
3. **避免诱导**：避免使用「最好的」「正确的」之类强烈价值判断词。
4. **双语并行**：每条题面同时维护中英两版（`src/i18n/locales/{en,zh}/strengths.json`），中文不是英文的逐字直译，而是符合中文表达习惯的等义版本。
5. **保持主题信号**：题面表达必须能清晰让被试将其与对应 `themesA/themesB` 关联，不必揭示主题名。

## 4. 法律与许可

- 本仓库代码遵循 `Apache-2.0`；题库结构与重写后的题面属于本项目原创/改编内容。
- 「CliftonStrengths™」「StrengthsFinder®」为 Gallup, Inc. 的注册商标，本项目不附属于、不代表 Gallup, Inc.，亦不与官方测评等价。
- 若你为本项目贡献新题，请确认你的贡献符合本文档原则；带有疑似官方原文复制的 PR 将被拒收或要求重写。

## 5. 版本

- 当前 `QUESTION_BANK_VERSION = "1.0.0"`，对应 100 道题，全部 `source = adapted-from-original-pair`。
- 后续任何题目正文/数量调整须递增版本号；历史条目通过 `HistoryEntry.questionBankVersion` 留痕。
