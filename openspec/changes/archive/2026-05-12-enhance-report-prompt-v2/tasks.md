## 1. 注入优势定义与领域档案

- [x] 1.1 在 `aiService.ts` 中 `import` `zh/strengths.json` 与 `en/strengths.json`
- [x] 1.2 新增 `getThemeDefinition` 辅助函数，按 locale 读取主题的 name 和 description
- [x] 1.3 硬编码 `DOMAIN_PROFILES_ZH` 常量（4 个领域的 essence + leadership 描述）
- [x] 1.4 硬编码 `DOMAIN_PROFILES_EN` 常量
- [x] 1.5 扩展 `summarizeDomains` 函数，额外返回 `dominant`（主导领域数组，支持并列）

## 2. 重写 buildPrompt 内容

- [x] 2.1 重写中文 user message：注入每个优势的定义、在场领域的本质+领导力风格、主导领域、缺失领域的本质+缺席领导力风格
- [x] 2.2 重写英文 user message：同上结构
- [x] 2.3 重写中文 system message：新增"盖洛普框架"段落，澄清"领导力非独立领域"
- [x] 2.4 重写英文 system message：同上
- [x] 2.5 在"我看见的你"章节指引中加入"必须显式声明领导力风格"要求
- [x] 2.6 章节命名改为共情视角："过度工作的保护机制"、"你已经拥有的力量与适合的战场"等
- [x] 2.7 新增开场白（无标题）和结语（## 最后想对你说）两个章节
- [x] 2.8 规则中新增禁用"你应该/你必须/你总是"，推荐"我注意到/你似乎/有可能"
- [x] 2.9 调整总字数约束：中文 1100-1500、英文 850-1150

## 3. 验证

- [x] 3.1 TypeScript 编译无错误
- [ ] 3.2 使用 GLM-4-Flash 实测中文报告，确认新增的领导力风格声明与领域分析落地
- [ ] 3.3 确认高级模型报告质量保持或提升
