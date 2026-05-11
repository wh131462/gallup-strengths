## Context

应用目前支持 OpenAI 兼容 和 Anthropic 两类 provider。配置面板 [src/components/SettingsModal.tsx](src/components/SettingsModal.tsx) 把 `model` 当成纯文本字段，用户需自行知道并输入准确的模型 ID（如 `gpt-4o-mini`、`deepseek-chat`）。错误配置只会在调用 [analyzeStrengths()](src/services/aiService.ts#L101) 时报错，反馈链路过长。

OpenAI 兼容协议普遍提供 `GET /v1/models` 接口，可用来列出可用模型；Anthropic 官方接口无对应稳定的浏览器友好端点。所有调用均直接从浏览器发出（无后端代理），需要考虑 CORS 与超时控制。

## Goals / Non-Goals

**Goals:**
- 用户填好 baseUrl + apiKey 后，能从下拉中选择模型，无需记忆 ID
- 提供独立的「测试连通性」按钮，结果在 UI 上即时呈现
- 当 `/models` 接口不可用时优雅降级为手动输入
- 保留对自定义模型名的支持（兼容自托管、私有微调模型）

**Non-Goals:**
- 不缓存模型列表到 localStorage（每次面板打开/输入变更时按需获取）
- 不实现 provider 自动发现（仍由用户先选择 provider 类型）
- 不为 Anthropic 实现完整的模型列表 API 调用（无标准端点）

## Decisions

### 1. 模型选择采用 combobox 而非纯下拉
下拉 + 允许自由输入（datalist 或自定义 combobox）。**Why:** 兼容标准模型与用户自定义模型 ID；避免私有部署用户被锁死在固定列表里。**Alternative considered:** 纯 `<select>`——被否决，无法支持自定义模型。

### 2. OpenAI 兼容 provider 使用 `GET {baseUrl}/models`
请求头携带 `Authorization: Bearer {apiKey}`，解析 `data[].id` 作为模型选项。**Why:** 这是 OpenAI 兼容协议事实标准，DeepSeek/Moonshot/Ollama/通义 等均实现。**Trade-off:** 个别服务可能未实现——失败时降级到预设候选 + 自定义输入。

### 3. Anthropic provider 使用静态候选列表
维护一个内置候选（`claude-3-5-sonnet-latest`、`claude-3-5-haiku-latest`、`claude-3-opus-latest` 等），同时允许手动输入。**Why:** 无稳定列表 API；模型集合变更频率低。

### 4. 连通性测试策略
- OpenAI 兼容：调用 `GET /models`（轻量、不消耗 token）；若 provider 不支持则回退为最小 chat 请求（`max_tokens: 1`）
- Anthropic：发起一个 `max_tokens: 1` 的极简 `/messages` 请求
- 区分错误类别：网络/CORS 错误 → 「无法连接」；401/403 → 「鉴权失败」；404 → 「baseUrl 错误」；其他 4xx/5xx → 显示状态码与响应片段

### 5. 模型列表获取的触发时机
- provider 切换时
- baseUrl 失焦（onBlur）且 apiKey 非空时
- apiKey 失焦且 baseUrl 非空时
- 手动点击下拉旁的「刷新」按钮

**Why:** 不在每次按键时请求，避免抖动与无效调用。

### 6. 请求超时
所有 provider 探测请求统一 10 秒超时（`AbortController`）。**Why:** 避免用户在错误 baseUrl 上无限等待。

## Risks / Trade-offs

- **[CORS 拦截]** 部分自托管 provider（如本地 Ollama 未配置 CORS）会拦截浏览器请求 → 在错误提示中明确建议「检查 provider 的 CORS 设置」，并保留手动输入模型名的能力，使配置仍可保存
- **[apiKey 泄漏到列模型请求]** 列模型仍然需要 apiKey → 与现有 chat 调用风险等同，未引入新增风险
- **[模型列表过长]** 某些聚合 provider 返回数百模型 → combobox 自带过滤；不做服务端筛选
- **[Anthropic 列表过时]** 静态候选可能滞后官方发布 → 允许自定义输入兜底，且候选写在易维护的常量数组中
