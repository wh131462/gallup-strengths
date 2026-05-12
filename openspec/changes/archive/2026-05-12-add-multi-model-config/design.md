## Context

当前 AI 配置以单一 JSON 对象存储在 `localStorage` key `gallup-strengths.ai-config` 中，结构为 `{ provider, baseUrl, apiKey, model }`。`loadAIConfig()` 返回该对象或 null，`aiService.ts` 直接消费。Settings 面板为单表单编辑模式。

用户需要在多个 AI 服务间切换（GLM 免费、OpenAI 付费、本地 Ollama 等），当前每次切换需重新填写全部字段。

## Goals / Non-Goals

**Goals:**
- 支持保存多套完整 AI 配置（每套含 provider/baseUrl/apiKey/model）
- 提供「活动配置」概念，系统始终使用活动配置
- Settings 面板支持配置列表的 CRUD 与活动切换
- 主界面提供快速切换入口（无需打开 Settings）
- 报告重试时可选择另一配置
- 旧单一配置自动迁移为列表首条

**Non-Goals:**
- 不支持按场景自动选择��型（如根据语言自动切换）
- 不支持配置同步到云端
- 不支持配置导入/导出文件
- 不改变 AI 调用逻辑本身（prompt、retry 等不变）

## Decisions

### 1. 数据结构：Profile 列表 + activeId

```ts
interface AIConfigProfile {
  id: string;          // nanoid 或 crypto.randomUUID()
  name: string;        // 自动生成，可编辑
  provider: AIProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  createdAt: number;
}

interface AIConfigStore {
  profiles: AIConfigProfile[];
  activeId: string | null;
}
```

**理由**：将 activeId 与 profiles 分离，便于独立切换活动配置而不触发列表重写。使用 id 而非 index 引用，避免删除/排序导致引用失效。

**替代方案**：用 index 标记活动项 → 删除操作需额外处理 index 偏移，不如 id 稳定。

### 2. 存储 key 变更

新 key: `gallup-strengths.ai-config-profiles`

保留旧 key `gallup-strengths.ai-config` 不删除（迁移后标记 `_migrated: true`），便于回滚。

**理由**：新旧 key 共存期间，旧版本代码仍可读取旧 key 正常工作。

### 3. 名称自动生成策略

格式：`{provider 标签} / {model}`，如 `OpenAI / gpt-4o-mini`、`Anthropic / claude-3-5-sonnet-latest`。

用户可在编辑时修改名称。名称不要求唯一。

### 4. Settings 面板 UI 模式

采用「列表视图 + 编辑视图」双模式：
- 列表视图：展示所有配置卡片，每张卡片显示名称、provider、model，提供「设为活动」「编辑」「删除」操作
- 编辑视图：��用现有表单（provider/baseUrl/apiKey/model + 名称字段），保存后回到列表视图
- 新增按钮在列表底部

**理由**：复用现有表单逻辑，改动最小。列表视图让用户一目了然所有配置。

### 5. 快速切换组件

在 ResultsPage 的报告生成按钮附近放置一个小型下拉选择器，仅显示配置名称列表，选中即切换活动配置。

### 6. loadAIConfig() 接口保持不变

`loadAIConfig(): AIConfig | null` 签名不变，内部改为读取 activeId 对应的 profile 并返回。这样 `aiService.ts` 无需任何改动。

## Risks / Trade-offs

- **localStorage 容量** → 多套配置含 apiKey，总量仍远小于 5MB 限制，风险极低
- **迁移失败** → 旧 key 保留不删除，最坏情况用户手动重新配置一次
- **名称冲突** → 不强制唯一，用户可能创建同名配置 → 列表中用 id 区分，UI 上显示 provider 辅���区分
- **快速切换误触** → 切换后不自动重新生成报告，仅影响下次生成，风险可控
