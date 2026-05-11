## Why

当前报告生成提示词（`buildPrompt`）设计时假设使用 GPT-4o 或 Claude 3.5 级别模型，对低级模型（如 GLM-4-Flash、GPT-3.5、Qwen-Turbo 等）不够友好——这些模型在面对开放式、高抽象度指令时容易产出结构混乱、内容空泛、格式不一致的报告。项目已支持 GLM 免费方案，需要确保免费用户也能获得可读、有价值的报告。

## What Changes

- 重写 `buildPrompt` 函数中的系统提示词，采用对低级模型更友好的提示工程策略：
  - 添加明确的输出格式模板（Markdown 结构骨架）
  - 为每个章节提供具体的写作指引和字数范围约束
  - 使用 few-shot 示例片段引导输出风格
  - 拆分 system message 和 user message，利用角色分离提升遵从度
  - 添加负面约束（不要做什么）减少跑题
- 调整 API 调用参数，为不同模型能力层级提供合理的 `temperature` 和 `max_tokens` 设置
- 保持高级模型的报告质量不退化

## Capabilities

### New Capabilities
- `structured-report-prompt`: 结构化报告提示词系统——包含格式模板、章节指引、示例片段和负面约束的完整提示词方案

### Modified Capabilities
（无现有 spec 级别的需求变更）

## Impact

- 主要修改文件：`src/services/aiService.ts`（`buildPrompt` 函数重写、API 调用参数调整）
- 可能涉及：`src/services/aiConfig.ts`（如需根据模型名推断能力层级）
- 不影响 UI 组件、路由、存储逻辑
- 不引入新依赖
