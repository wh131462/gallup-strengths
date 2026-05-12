## ADDED Requirements

### Requirement: 提示词注入优势官方定义
user message SHALL 为前 5 大优势中的每一项附带来自 `i18n/locales/{zh,en}/strengths.json` 的官方简短定义（`description` 字段）。

#### Scenario: 中文优势定义注入
- **WHEN** locale 为中文，用户前 5 大优势包含"学习"
- **THEN** user message MUST 包含类似"- 学习（战略思维）——追求新知，享受过程。"的格式

#### Scenario: 英文优势定义注入
- **WHEN** locale 为英文，用户前 5 大优势包含 Learner
- **THEN** user message MUST 包含形如 "- Learner (Strategic Thinking) — <description>" 的格式

### Requirement: 提示词注入领域本质与领导力风格
user message SHALL 为用户前 5 大优势涉及的每个盖洛普领域，以及缺失的领域，注入结构化描述，包含"本质（essence）"和"对应领导力风格（leadership style）"两个字段。

#### Scenario: 在场领域描述
- **WHEN** 用户前 5 大优势覆盖了某个领域
- **THEN** user message MUST 列出该领域的名称、优势数量、本质描述、对应领导力风格描述

#### Scenario: 缺失领域描述
- **WHEN** 用户前 5 大优势未覆盖某个盖洛普领域
- **THEN** user message MUST 将其列入"缺失的领域"部分，包含本质与"缺席的领导风格"说明

### Requirement: 主导领域识别
`buildPrompt` 函数 SHALL 计算主导领域（出现次数最多的领域），若多个领域并列第一则全部列出。

#### Scenario: 单一主导领域
- **WHEN** 某领域出现次数严格大于其他所有领域
- **THEN** user message 中"主导领域"字段 MUST 仅列出该领域

#### Scenario: 并列主导领域
- **WHEN** 多个领域出现次数并列最高
- **THEN** user message 中"主导领域"字段 MUST 按"A + B"格式列出全部并列领域

### Requirement: 报告显式报出领导力风格
system message SHALL 要求 AI 在"我看见的你"章节中用一句话明确指出阅读者最接近的盖洛普领导力风格，基于主导领域推导。

#### Scenario: 领导力风格显式声明
- **WHEN** AI 生成报告
- **THEN** "我看见的你"章节 MUST 包含一句明确说明阅读者属于"执行型/影响型/关系型/战略型"或混合型领导者的句子

### Requirement: 澄清领导力非独立领域
system message SHALL 明确告知 AI："领导力"不是独立的第五领域，而是每个领域在领导者身上的展开方式，防止 AI 虚构领域。

#### Scenario: 框架说明文字
- **WHEN** 查看 system message 的"盖洛普框架"段落
- **THEN** MUST 包含类似"领导力不是独立的领域，而是每个领域在领导者身上的展开方式"的澄清语句

## MODIFIED Requirements

### Requirement: 提示词包含 Markdown 输出骨架
system message SHALL 包含完整的 Markdown 输出结构模板，明确指定每个章节的标题层级和内容要求。骨架 MUST 采用"开场白（无标题）+ 5 个主章节 + 结语"的结构，主章节命名需采用优势视角与共情语气。

#### Scenario: 报告输出包含所有必需章节
- **WHEN** AI 模型根据提示词生成报告
- **THEN** 输出 MUST 按顺序包含：开场白段落（无标题）、"## 我看见的你"、"## 那些'过度工作'的保护机制"、"## 你已经拥有的力量与适合的战场"、"## 本周可以试着走的一步"、"## 最后想对你说"（英文对应：Opening paragraph、Who You Are、The Protective Patterns That May Cost You、The Resources Already In Your Hands、Directions You Might Try This Week、A Closing Note）

#### Scenario: 骨架模板在提示词中可见
- **WHEN** 查看 system message 内容
- **THEN** MUST 包含以 `##` 开头的章节标题模板，每个章节下有内容指引说明

#### Scenario: 组合配对张力要求
- **WHEN** 查看"## 我看见的你"章节的指引
- **THEN** MUST 要求至少识别 2 组"具体优势之间的互动"（形如"当<优势A>遇上<优势B>"）

### Requirement: 每个章节包含字数范围约束
提示词 SHALL 为每个报告章节指定建议字数范围，引导模型产出适当长度的内容。

#### Scenario: 中文报告章节字数约束
- **WHEN** locale 为中文
- **THEN** 提示词中每个章节 MUST 标注建议字数范围，且总报告建议长度为 1100-1500 字

#### Scenario: 英文报告章节字数约束
- **WHEN** locale 为英文
- **THEN** 提示词中每个章节 MUST 标注建议字数范围，且总报告建议长度为 850-1150 words

### Requirement: 提示词包含负面约束
system message SHALL 包含明确的负面约束列表，禁止常见的低质量输出模式，并推荐邀请式措辞。

#### Scenario: 禁用措辞清单
- **WHEN** 查看 system message 内容
- **THEN** MUST 明确禁用"你应该"、"你必须"、"你总是"、空泛夸赞（"你很棒"、"你很特别"）、以及逐字复述字典定义

#### Scenario: 推荐措辞清单
- **WHEN** 查看 system message 内容
- **THEN** MUST 推荐使用"我注意到"、"你似乎"、"有可能"、"一个方向是"等邀请性表达

### Requirement: 本周行动建议的具体化
"本周可以试着走的一步"章节 SHALL 强制要求提供恰好 2 个行动，每个行动必须包含"做什么、什么时候做、如何知道完成"三要素，并采用邀请式措辞。

#### Scenario: 行动数量
- **WHEN** AI 生成报告
- **THEN** "本周可以试着走的一步"章节 MUST 包含恰好 2 个具体行动

#### Scenario: 行动三要素
- **WHEN** 查看每个行动
- **THEN** MUST 包含做什么、何时做、如何判断完成这三个要素
