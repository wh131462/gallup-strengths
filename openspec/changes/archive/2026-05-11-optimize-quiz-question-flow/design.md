## Context

`strengths-navigator` 当前是一个无后端的 Vite + React + TypeScript 单页应用，主流程为 `Landing → Quiz(100 题, 强制) → Results`，题目以扁平数组定义在 `src/constants.ts`，题面文本由 i18n（`src/i18n/locales/{en,zh}/quiz.json`）按 `id` 取得。`HistoryEntry` 已支持本地持久化（见 `add-local-test-history`），`AdvisorReport` 由前端调用 AI 接口生成。

本变更的核心驱动是「降低参与门槛 + 提升题库可信度」：

- 100 题对路过的用户是劝退，对认真用户却是必要的精度来源——需要让用户自己选。
- 现有 100 题虽然结构均衡，但题面文本和来源缺乏文档化沉淀，扩展或替换困难。需要把题库提升为带版本、带来源标注的一等数据。

约束：

- 必须保持现有 `src/services/historyStorage.ts` 的向后兼容（不能让老用户打开应用就丢历史）。
- 不引入新运行时依赖；保持纯前端、可部署到 GitHub Pages。
- i18n 文案需中英对齐，由现有 `scripts/check-i18n.*` 校验。

## Goals / Non-Goals

**Goals:**
- 用户可在三档（30 / 60 / 100）中选择测评长度，进度与结果展示按实际题数动态适配。
- 题目库重构为带版本号、带来源标注的结构化资源，便于后续扩容或替换。
- 三档题目子集在 6 种 domain 配对上保持均衡，保证短版本结果仍可用于 Top-5 计算。
- 现有历史数据零迁移成本（读时兼容）。

**Non-Goals:**
- 不重写 Top-5 / domain 分数算法（仅传入题数变化）。
- 不引入服务器侧题库或动态拉取（题库仍是构建期静态资源）。
- 不实现自适应题量（CAT）或题目随机抽样（保持确定性子集，便于复现）。
- 不做 Quick 与 Deep 之间「续作扩展」的功能（同一次测评只在选定档位内完成）。

## Decisions

### Decision 1: 三档定为 30 / 60 / 100

- **选择**：`quick = 30`、`standard = 60`、`deep = 100`。
- **理由**：6 种 domain 配对均衡 → 题数须是 6 的倍数；30/60/100 中 100 已是现状不能动，30 和 60 接近 30 也是 6 的倍数，60 是 6 的倍数，100 不是 6 的倍数（但作为「全集」其结构本来就由现有 100 题保证，配对分布已知是均衡的，不受 6 整除约束）。
- **替代**：考虑过 25/50/100 或 24/48/96。25/50 不能被 6 整除会让快速版每个配对差异较大；24/48/96 让 deep 不等于现有 100，需要题库改写工作量更大。
- **取舍**：30/60 + 现有 100 在工程量与均衡性上是最佳折中。

### Decision 2: 题库子集采用确定性切片，而非随机抽样

- **选择**：按 `(domainA, domainB)` 分组后，组内按 `id` 升序取前 `ceil(N/6)`，全局再裁到 N 题；同一档每次结果相同。
- **理由**：可复现、可在 PR 中 diff、避免「重测得到不同 Top-5」造成的体验混乱；同时利于 i18n 校验（不会出现「采到的题恰好缺文案」）。
- **替代**：用户层面随机 + seed。会让历史复现复杂，且短期对结果稳定性观感有害。
- **取舍**：损失了一点「题目多样性感」，但换来稳定与可调试性。如有必要后续可加 `seed` 参数。

### Decision 3: 题面文本继续放在 i18n，不放在题库

- **选择**：`questionBank.ts` 只保留结构（id + domain + themes + tags + source），中英文题面继续放 `quiz.json`。
- **理由**：项目已有这套机制，复用降低改动面；非英文用户可单独迭代翻译；CI 校验已就位。
- **替代**：把题面塞回题库（多语言变成对象字段）。会破坏既有 i18n pipeline、增加 bundle 体积。

### Decision 4: 历史条目向后兼容策略

- **选择**：读时回填——读取旧 `HistoryEntry` 时，若缺 `quizLength` 取 `Object.keys(answers).length`，若缺 `questionBankVersion` 设为 `"legacy"`。新写入一律带这两个字段。
- **理由**：避免一次性写迁移逻辑，旧条目自然「升级」。
- **替代**：启动时一次性迁移 store。多一次写入，旧浏览器/无痕模式异常需要处理。

### Decision 5: 题目内容来源策略

- **选择**：不复制官方 CliftonStrengths 受版权题目原文，而是基于公开「StrengthsFinder 风格 forced-choice pair」资料整理 + 自行重写得到 100 道对比题，每题在题库中标注 `source` 字段（如 `"public-pair-style"`、`"author-original"`），并在 `specs/quiz-question-bank/spec.md` 的「题目内容来源与许可」章节列出来源清单与重写原则。
- **理由**：盖洛普官方题目受版权保护，逐字复制有法律风险；本应用为非商业开源教育用途，重写后的对比题既能保留测评信度又规避风险。
- **替代**：只做自创题（保险但题库扩展慢）；接入第三方题库 API（增加后端依赖，与 Non-Goals 冲突）。
- **取舍**：扩展速度 vs 法律安全 → 选择安全。

### Decision 6: 路由/状态机改动最小化

- **选择**：在 `App.tsx` 现有 `view` 状态机里加一个 `'lengthSelection'` 取值；不引入 react-router。`QuizPage` 改为接收 `questions: Question[]` props。
- **理由**：项目目前用一个枚举状态切视图，加一档代价最低。
- **替代**：引入 react-router。带来 SPA 路由的复杂度但本应用是简单线性流程，性价比低。

## Risks / Trade-offs

- **[Risk] 短题量降低结果置信度** → 在 `LengthSelection` 文案明确「Quick 适合快速感受，Deep 用于精准报告」；在结果页与历史列表同时展示题数让用户自知。
- **[Risk] 题库扩写带来题面译文与原题不一致**（中英两套要同步） → 通过现有 `check-i18n` 脚本 + 本变更新增的「题面与题库 id 完整性校验」一并防回归。
- **[Risk] 题库 `source` 标注主观/不准确** → 在 spec 中限定 `source` 必须落入预设枚举集合（spec 文件维护清单），代码层用 `as const` 数组校验；CI 触发对未知 source 的告警。
- **[Risk] 历史条目兼容 bug** → 在 `historyStorage` 读路径写单测：旧条目（无新字段）→ 读出后字段被回填且原值未篡改。
- **[Trade-off] 不做随机化** → 损失「重测多样性」的体感，但本变更优先保证可复现与可调试，后续可作单独提案添加 `seed`。

## Migration Plan

1. **数据层**：新建 `src/data/questionBank.ts`，将 `constants.ts` 现有 `QUESTIONS` 迁入并补齐 `tags / source`；`constants.ts` 暂保留 `export { QUESTIONS } from './data/questionBank'` 兼容别名。
2. **i18n**：为现有 100 题在 `quiz.json` 中确认 `items.<id>.statementA/B` 完整；新增 `lengthSelection.json`（中英）。
3. **UI**：新建 `LengthSelectionPage`；`App.tsx` 增 `'lengthSelection'` 视图与跳转；`QuizPage` 改 props。
4. **历史**：`types.ts` 扩展字段；`historyStorage.ts` 读时兼容、写时带新字段；`HistoryList` 渲染 `quizLength`。
5. **CI**：更新 `scripts/check-i18n.*` 校验 `lengthSelection` 命名空间与 `quiz.items` 对题库 id 的覆盖。
6. **回滚策略**：所有改动集中在前端代码与 JSON 资源；如线上发现关键 bug，回滚到上一个 release commit 即可，localStorage 中带新字段的历史条目对旧代码不可见但也不会损坏（旧代码读不到新字段，但 JSON parse 仍成功）。

## Open Questions

- 是否在 `LengthSelection` 提供「上次选择记忆」（localStorage 存上次的 length）？倾向是后续 PR 再加，本次默认推荐 `standard`。
- 题库扩展到 100 题以外是否需要新档（如 `mini = 12`）？暂不做，留作未来变更。
- `source` 枚举的最终清单（建议至少：`public-pair-style`、`adapted-from-original-pair`、`author-original`）是否需要法律审阅签字？由维护者决定，本变更中先以技术约束落地。
