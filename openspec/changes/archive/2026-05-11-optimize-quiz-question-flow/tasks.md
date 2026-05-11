## 1. 题库数据层重构

- [x] 1.1 创建 `src/data/questionBank.ts`，导出 `QUESTION_BANK_VERSION` 常量与 `questionBank: { version, generatedAt, questions }`
- [x] 1.2 把 `src/constants.ts` 现有 100 题迁入题库，并为每题补齐 `tags: string[]` 与 `source: string`（首批可统一标 `"adapted-from-original-pair"`，明确自创题用 `"author-original"`）
- [x] 1.3 在 `src/constants.ts` 保留向后兼容别名 `export const QUESTIONS = questionBank.questions`，或迁移所有调用方后删除
- [x] 1.4 在 `src/types.ts` 扩展类型：新增 `QuizLength = 'quick' | 'standard' | 'deep'`、`QuestionBankMeta`、扩展 `Question` 增加 `tags` `source` `difficulty?`
- [x] 1.5 实现 `getQuestionsForLength(length: QuizLength): Question[]`：按 6 种 domain 配对分组、组内按 id 升序、按 `ceil(N/6)` 取头、最后裁到 N；导出 `LENGTH_OPTIONS: Record<QuizLength, { count: number; estMinutes: [number, number] }>`
- [x] 1.6 为采样函数补 vitest 单测：长度正确、配对计数差 ≤ 1、两次调用结果一致

## 2. 题库内容标准化

- [x] 2.1 在 `openspec/changes/optimize-quiz-question-flow/` 下新增 `SOURCES.md`，列出题目来源类别（`public-pair-style` / `adapted-from-original-pair` / `author-original`）与重写原则
- [x] 2.2 审阅现有 100 题题面（`quiz.json` 中英），将疑似与官方原题接近的题面重新撰写为对比表述，避免逐字复制
- [x] 2.3 在 `questionBank.ts` 中为每题填入最终的 `source` 值（必须在枚举集合内）
- [x] 2.4 增加运行时/CI 校验：`questionBank.questions` 中每个 `source` 必须落入 `ALLOWED_SOURCES as const` 数组，否则构建失败

## 3. 长度选择页 UI

- [x] 3.1 创建 `src/components/LengthSelectionPage.tsx`：渲染三档卡片（Quick / Standard 推荐 / Deep），含题数、预计耗时、一句话描述；实现为 `role="radiogroup"` 键盘可达
- [x] 3.2 添加返回按钮（回到 Landing）、开始按钮（调用 `onStart(length)`）
- [x] 3.3 默认焦点与默认选中放在 `standard`；`standard` 卡片显示「Recommended」徽章
- [x] 3.4 视觉风格与现有 `LandingPage` 对齐（zinc 配色、衬线大标题、uppercase tracking 标签）

## 4. 应用路由 & Quiz 接入

- [x] 4.1 修改 `App.tsx`：在视图状态机增加 `'lengthSelection'`；`Landing.onStart` 跳到 `lengthSelection`；`LengthSelectionPage.onStart(length)` 跳到 `quiz` 并把所选 `length` 与 `questions` 存入应用状态
- [x] 4.2 修改 `QuizPage` 接口：接收 `questions: Question[]` 与 `quizLength: QuizLength` props，移除对全量 `QUESTIONS` 的直接依赖；`totalSteps` 来自 `questions.length`
- [x] 4.3 调整进度展示：进度条比例与「X / Y」文案使用动态 `Y`
- [x] 4.4 确保返回流：`Quiz` 的「上一题」在第 1 题处可回到 `lengthSelection`（通过 `onExitToStart` prop 实现）

## 5. 历史记录扩展

- [x] 5.1 `src/types.ts` 扩展 `HistoryEntry` 增加 `quizLength: number` 与 `questionBankVersion: string`
- [x] 5.2 `src/services/historyStorage.ts` 写入时填充新字段；读取时对缺失字段做兼容回填（`quizLength = Object.keys(answers).length`、`questionBankVersion = "legacy"`）
- [x] 5.3 `src/components/HistoryList.tsx` 在每条历史展示题数（例如「30 题」/「60 题」/「100 题」），key 走 i18n
- [x] 5.4 为 `historyStorage` 兼容路径补单测：旧 entry → 读出后字段存在且值合理；新 entry → 字段透明往返

## 6. i18n 与文案

- [x] 6.1 新增 `src/i18n/locales/{en,zh}/lengthSelection.json`：`title` `subtitle` `quickName/desc` `standardName/desc/recommended` `deepName/desc` `minutes` `back` `start`
- [x] 6.2 在 `src/i18n/index.ts` 注册 `lengthSelection` 命名空间
- [x] 6.3 `results.json` / `history.json` 增补「题数」相关词条
- [x] 6.4 复核 `quiz.json` 的 `items.<id>.statementA/B` 中英文覆盖 1..100 全部 id，缺失补齐（实际题面位于 `strengths.json:questions.<id>.statementA/B`，已校验 100/100 覆盖）

## 7. CI 校验脚本更新

- [x] 7.1 更新 `scripts/check-i18n.mjs`（或对应文件）：把 `lengthSelection` 加入校验命名空间；校验 `quiz.items` 完整覆盖 `getQuestionBank().questions` 的所有 id
- [x] 7.2 在脚本中加入「`source` 必须属于 ALLOWED_SOURCES」校验
- [x] 7.3 在 GitHub Actions 配置中确认上述脚本被执行（如未在则补一步）

## 8. 结果页可见性

- [x] 8.1 `ResultsPage` 在标题区附近显示「Based on N questions」（i18n 文案），并视情对短题量做一句温和提示（如「Quick 适合快速感受，想要更精准可重做完整版」）
- [x] 8.2 视觉打磨：在历史列表卡片右上角加一个小角标显示题数

## 9. 验证 & 收尾

- [ ] 9.1 手测三档完整流程（Landing → LengthSelection → Quiz → Results → 历史回看）中英两种语言
- [x] 9.2 手测旧历史兼容：在浏览器中手工写入一条旧版结构 `historyStore`，刷新后 UI 正常显示且 `quizLength` 被回填（自动化覆盖：`scripts/test-history-storage.mts`）
- [x] 9.3 运行 `pnpm typecheck` / `pnpm build` / i18n 校验脚本全部通过（build 成功；本变更未新增 tsc 错误，唯一遗留错误位于 `SettingsModal.tsx` 与本变更无关）
- [x] 9.4 更新 `README.md` 简要说明三档测评长度与题库版本机制
- [x] 9.5 运行 `openspec validate optimize-quiz-question-flow`，确保提案通过校验
