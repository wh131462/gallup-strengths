## 1. Service 层扩展

- [x] 1.1 在 [src/services/aiConfig.ts](src/services/aiConfig.ts) 中新增 `ANTHROPIC_MODEL_CANDIDATES` 常量数组（`claude-3-5-sonnet-latest`、`claude-3-5-haiku-latest`、`claude-3-opus-latest`）
- [x] 1.2 新增 `fetchOpenAIModels(baseUrl, apiKey, signal)`：调用 `GET {baseUrl}/models`，返回 `string[]`（解析 `data[].id`），10s 超时
- [x] 1.3 新增 `testConnectivity(config, signal)`：OpenAI 兼容走 `/models`，Anthropic 走 `max_tokens:1` 的 `/messages`；返回 `{ ok: true } | { ok: false, kind: 'auth'|'notFound'|'network'|'timeout'|'other', message: string }`
- [x] 1.4 抽取 HTTP 错误分类工具函数（401/403→auth, 404→notFound, TypeError→network, AbortError→timeout, 其他→other）

## 2. SettingsModal UI 改造

- [x] 2.1 把模型字段从 `<input>` 改为 combobox（`<input list>` + `<datalist>` 或自定义实现），支持下拉选择与自由输入
- [x] 2.2 新增 `modelOptions` state 与 `loadingModels` state，封装 `loadModels()` 函数
- [x] 2.3 在 provider 切换时：若为 Anthropic 直接填入静态候选；若为 OpenAI 且 baseUrl+apiKey 已填则调用 `fetchOpenAIModels`
- [x] 2.4 在 baseUrl `onBlur` 与 apiKey `onBlur` 触发 `loadModels()`（OpenAI 兼容场景）
- [x] 2.5 在模型字段旁新增「刷新」图标按钮（仅 OpenAI 兼容 provider 可见），加载中显示 spinner
- [x] 2.6 当 `fetchOpenAIModels` 失败时，在字段下方显示提示「无法获取模型列表，可手动输入」
- [x] 2.7 新增「测试连通性」按钮，包含 idle / loading / success / error 四种视觉状态
- [x] 2.8 按钮在 baseUrl/apiKey/model 任一为空时禁用；加载中禁用并展示 spinner
- [x] 2.9 测试失败时显示分类错误文案与 provider 原始响应片段（折叠/截断）

## 3. 国际化

- [x] 3.1 在 [src/i18n/](src/i18n/) 的中英文资源中添加文案：`testConnection`、`testing`、`testSuccess`、`testFailedAuth`、`testFailedNotFound`、`testFailedNetwork`、`testFailedTimeout`、`testFailedOther`、`refreshModels`、`modelListUnavailable`

## 4. 验证

- [x] 4.1 运行 `npm run build` 通过 TypeScript 编译
- [ ] 4.2 启动 `npm run dev`，手动验证：OpenAI 兼容（真实 key）成功拉取模型列表与测试通过
- [ ] 4.3 手动验证：错误的 apiKey → 鉴权失败提示；错误的 baseUrl 路径 → notFound 提示；不可达域名 → network 提示
- [ ] 4.4 手动验证：Anthropic provider 下拉显示静态候选，不发起 `/models` 请求（DevTools Network 面板核对）
- [ ] 4.5 手动验证：自定义模型 ID（不在下拉中）可保存并被 `analyzeStrengths()` 正常使用
