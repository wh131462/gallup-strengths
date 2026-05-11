## 1. 重构 buildPrompt 返回结构

- [x] 1.1 将 `buildPrompt` 返回类型从 `string` 改为结构化消息数组类型（含 system 和 user 消息）
- [x] 1.2 编写中文 system message：角色设定 + Markdown 输出骨架 + 字数约束 + 负面约束
- [x] 1.3 编写英文 system message：角色设定 + Markdown 输出骨架 + 字数约束 + 负面约束
- [x] 1.4 编写中文 user message：注入用户优势数据 + 生成指令
- [x] 1.5 编写英文 user message：注入用户优势数据 + 生成指令

## 2. 适配 API 调用函数

- [x] 2.1 修改 `callOpenAI` 接收结构化消息，构建含 system/user 的 messages 数组，temperature 设为 0.6
- [x] 2.2 修改 `callAnthropic` 接收结构化消息，使用顶层 `system` 字段 + user messages，添加 temperature 0.6

## 3. 验证

- [x] 3.1 TypeScript 编译通过，无类型错误
- [ ] 3.2 使用 GLM-4-Flash 实际测试中文报告输出，确认结构完整
- [ ] 3.3 确认高级模型（如有配置）报告质量未退化
