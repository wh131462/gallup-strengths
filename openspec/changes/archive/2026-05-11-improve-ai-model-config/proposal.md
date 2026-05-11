## Why

当前 AI 模型配置体验较差：用户需要手动输入模型名称（容易拼错），且在保存前无法验证 baseUrl 和 apiKey 的正确性，配置错误只能在实际生成报告时才暴露。优化此体验可以显著降低首次配置门槛和试错成本。

## What Changes

- 模型字段从纯文本输入改为下拉选择器，下拉项由 provider 的 `/models` 接口动态获取
- 输入 baseUrl 和 apiKey 后自动尝试拉取模型列表；若接口不可用或用户偏好，仍允许手动输入自定义模型名
- 新增「测试连通性」按钮，独立验证当前配置是否能成功调用 provider（轻量 ping，如列模型或最小 chat 请求）
- 测试结果实时反馈：成功 / 失败原因（HTTP 状态、网络错误、鉴权失败等）
- Anthropic provider 因无标准模型列表接口，回退为预设候选 + 自定义输入

## Capabilities

### New Capabilities
- `ai-model-config`: AI provider 配置面板的模型发现与连通性验证能力

### Modified Capabilities
<!-- 无现有 spec 受影响 -->

## Impact

- [src/components/SettingsModal.tsx](src/components/SettingsModal.tsx)：UI 改造（下拉、测试按钮、状态提示）
- [src/services/aiConfig.ts](src/services/aiConfig.ts)：新增模型列表获取与连通性测试函数
- [src/i18n/](src/i18n/)：新增相关文案（测试按钮、加载/成功/失败提示）
- 无新增三方依赖；仅使用 fetch 调用 provider 的 `/models` 与 chat 接口
