## Why

当前测评固定使用 100 道题目，体验路径是「Landing → 直接进入第 1/100 题」，对只想要快速尝试的用户偏重，对希望更精准评估的用户也缺少配置入口。同时现有题库的题面文本（在 `i18n/quiz` 中已存在但项目实际仅按 id 索引结构）来源缺乏可追溯的标准依据，需要建立一份基于公开盖洛普 StrengthsFinder/CliftonStrengths 类型对比题型整理出的、有明确出处与许可标注的题目库。本次优化将「数量选择 + 题库扩容/标准化」一并落地，让用户可以根据投入的时间在多个测评长度间选择。

## What Changes

- **新增「测评长度选择」步骤**：在 Landing 与 Quiz 之间增加一个 `LengthSelectionPage`，用户从 Quick / Standard / Deep 三档中选择题目数量（拟定 30 / 60 / 100，最终数值在 design 中确定）。
- **题目库（QuestionBank）建模**：将 `src/constants.ts` 的扁平 `QUESTIONS` 重构为带元数据的题库（每题增加 `tags`、`difficulty?`、`source` 字段），并按类别为每档准备稳定的子集。
- **题目子集采样规则**：在选定档位时，按四大领域（Executing / Influencing / Relationship Building / Strategic Thinking）的两两对比均匀采样，保证每档子集在 domain 配对上仍然均衡，结果分析依旧有效。
- **题库内容标准化**：基于公开整理的盖洛普标准对比题面，扩充到至少 100 道高质量题目（中英双语），并在仓库 `openspec/specs/quiz-question-bank/` 中记录题目来源与版本号。
- **历史记录字段扩展**：`HistoryEntry` 增加 `quizLength`（题数）与 `questionBankVersion`（题库版本），便于不同长度/版本之间的历史回溯。**BREAKING**（仅对存量 history JSON：旧条目无该字段时按 `quizLength = 总答题数`、`questionBankVersion = "legacy"` 兼容读取，不影响展示）。
- **i18n 文案补齐**：新增 `lengthSelection` 命名空间（中英），更新 `landing.begin` 行为指向长度选择页。
- **结果页与历史展示**：在结果页与历史列表中显示本次测评所用题目数量，让用户区分快速版与完整版的结果置信度。

## Capabilities

### New Capabilities
- `quiz-question-bank`: 题目库的结构、版本、采样规则与内容来源管控（包括档位定义与子集均衡约束）。
- `quiz-length-selection`: 用户在进入测评前��择测评长度的流程（页面、状态、跳转、可访问性）。

### Modified Capabilities
<!-- 现有 specs（ai-model-config / ci-deployment / i18n / report-export）均不涉及需求层变更，仅 i18n 内容增补，不属于 spec 级别行为变化，故此处留空。 -->

## Impact

- **代码**：
  - `src/constants.ts`：拆分为 `src/data/questionBank.ts`（含元数据与版本号）；`QUESTIONS` 导出按需保留为兼容别名或在调用方迁移后移除。
  - `src/components/`：新增 `LengthSelectionPage.tsx`；`App.tsx` 路由状态增加 `lengthSelection` 步；`QuizPage.tsx` 接收 `questions` props 而非读全量。
  - `src/types.ts`：新增 `QuizLengthOption`、`QuestionBankMeta`，扩展 `HistoryEntry`。
  - `src/services/historyStorage.ts`：读旧条目时回填默认字段；写入时带新字段。
- **i18n**：新增 `locales/{zh,en}/lengthSelection.json`；`quiz.json` 题面文本扩展到题库版本对应的全部 id。
- **依赖**：无新依赖。
- **CI / 部署**：`scripts/check-i18n.*` 需把 `lengthSelection` 纳入校验；GitHub Pages 流程不变。
- **数据迁移**：localStorage 中既有 `historyStore` 通过读时兼容处理，无破坏性删除。
