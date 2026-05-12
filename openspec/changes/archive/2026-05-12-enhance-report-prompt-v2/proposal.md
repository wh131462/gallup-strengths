## Why

上一轮变更 `optimize-report-prompt-for-lower-models` 解决了"低级模型能不能产出结构化报告"的问题，但用户反馈读后"读完很顺，但合上之后想不起任何专属于我的东西"——报告缺乏深度共情、缺乏对"领导力维度"的显式分析、建议不够专属。本次 V2 升级把"优势教练式的深度共情 + 盖洛普四大领域对应的领导力风格 + 优势官方定义"三类新信息塞进提示词，让低级模型也能产出让人"被深深看见"的报告。

## What Changes

- 在提示词中注入**每个优势的官方简短定义**（来自 `i18n/locales/{zh,en}/strengths.json`），让 AI 不再靠词汇猜含义
- 代码层硬编码**四大领域的"本质 + 对应领导力风格"**描述，作为 user message 的结构化上下文
- 新增**主导领域计算**（并列时展示混合型领导风格）
- 明确澄清"领导力不是独立领域"，避免 AI 虚构第五维度
- 报告结构从"4 章" → "开场白 + 5 主章 + 结语"，融入心理咨询式共情风格
- 章节重命名：
  - "潜在阴影与盲点" → "那些'过度工作'的保护机制"（去诊断化）
  - "职场应用建议" → "你已经拥有的力量与适合的战场"（优势视角）
  - "本周行动建议" → "本周可以试着走的一步"（邀请式）
- 规则层新增：禁止"你应该/你必须/你总是"，推荐"我注意到/你似乎/有可能/一个方向是"
- 总字数区间：1050-1450 → 1100-1500（扩容承载新内容）

## Capabilities

### New Capabilities
（无新能力——本次变更扩展已有的 `structured-report-prompt` 能力）

### Modified Capabilities
- `structured-report-prompt`：扩展输入参考（优势定义 + 领域本质 + 领导力风格 + 主导领域），重构报告章节结构与语气

## Impact

- 修改文件：`src/services/aiService.ts`（引入 JSON import、新增常量表、重写 buildPrompt）
- 新增依赖引用：`src/i18n/locales/{zh,en}/strengths.json`（项目内部资源，非外部依赖）
- 不影响 UI 组件、API 调用参数（temperature、max_tokens 保持不变）
- 不改变 `analyzeStrengths` 的对外签名
