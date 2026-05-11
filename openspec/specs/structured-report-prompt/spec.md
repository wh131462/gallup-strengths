## ADDED Requirements

### Requirement: 提示词使用 system/user 角色分离
`buildPrompt` 函数 SHALL 返回结构化的消息数组（包含 system message 和 user message），而非单条字符串。system message 包含角色设定和输出规则，user message 包含具体任务和用户优势数据。

#### Scenario: OpenAI 兼容 provider 使用角色分离
- **WHEN** 调用 `callOpenAI` 发送报告生成请求
- **THEN** messages 数组 MUST 包含至少一条 `role: "system"` 消息和一条 `role: "user"` 消息

#### Scenario: Anthropic provider 使用 system 参数
- **WHEN** 调用 `callAnthropic` 发送报告生成请求
- **THEN** 请求体 MUST 使用顶层 `system` 字段传递系统提示词，`messages` 中仅包含 user 消息

### Requirement: 提示词包含 Markdown 输出骨架
system message SHALL 包含完整的 Markdown 输出结构模板，明确指定每个章节的标题层级和内容要求。

#### Scenario: 报告输出包含所有必需章节
- **WHEN** AI 模型根据提示词生成报告
- **THEN** 输出 MUST 包含以下四个二级标题章节：核心能量特质、潜在阴影与盲点、职场应用建议、本周行动建��（英文对应：Core Energy Profile、Potential Shadows & Blind Spots、Workplace Application、Action for This Week）

#### Scenario: 骨架模板在提示词中可见
- **WHEN** 查看 system message 内容
- **THEN** MUST 包含以 `##` 开头的章节标题模板，每个章节下有内容指引说明

### Requirement: 每个章节包含字数范围约束
提示词 SHALL 为每个报告章节指定建议字数范围，引导模型产出适当长度的内容。

#### Scenario: 中文报告章节字数约束
- **WHEN** locale 为中文
- **THEN** 提示词中每个章节 MUST 标注建议字数范围（如 150-300 字），且总报告建议长度为 800-1200 字

#### Scenario: 英文报告章节字数约束
- **WHEN** locale 为英文
- **THEN** 提示词中每个章节 MUST 标注建议字数范围（如 100-200 words），且总报告建议长度为 600-900 words

### Requirement: 提示词包含负面约束
system message SHALL 包含明确的负面约束列表，禁止常见的低质量输出模式。

#### Scenario: 负面约束内容
- **WHEN** 查看 system message 内容
- **THEN** MUST 包含至少以下约束：不要重复优势的字典定义、不要使用空泛的鼓励语、不要在开头写冗长的寒暄

### Requirement: temperature 参数调整
API 调用 SHALL 使用 0.6 作为 temperature 值。

#### Scenario: OpenAI 兼容调用 temperature
- **WHEN** 发送 OpenAI 兼容 API 请求
- **THEN** 请求体中 `temperature` MUST 为 0.6

#### Scenario: Anthropic 调用 temperature
- **WHEN** 发送 Anthropic API 请求
- **THEN** 请求体中 `temperature` MUST 为 0.6
