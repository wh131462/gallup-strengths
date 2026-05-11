# Add GLM-4-Flash Free Tier Onboarding Guide

## Why

新用户首次访问产品时，`analyzeStrengths` 要求先在 Settings 中配置 AI 服务。这对没有 AI 背景的用户来说门槛较高：他们需要了解 OpenAI / Anthropic 生态、知道去哪里注册、理解 baseUrl 与 model 的概念。

我们曾尝试通过内置免费通道（Pollinations.ai 匿名端点）实现"零配置开箱即用"，但实测发现：
1. Pollinations 匿名档当前只有 1 个模型 (GPT-OSS 20B reasoning)，对长 prompt 响应时长 >50s 且常被 Cloudflare 502 拦截。
2. 该方案实际不可用，会给用户"产品坏了"的错误印象。

更现实的路径是：**降低门槛，但不取消门槛**——推荐一个真免费、真稳定的方案，并把填 Key 的步骤尽量简化到一键完成。

智谱 AI 的 **GLM-4-Flash** 对个人用户**完全免费**、稳定可用、OpenAI 接口格式兼容、中文场景表现良好，是当前首选推荐。

## What Changes

- 在 `src/services/aiConfig.ts` 中新增常量 `GLM_FREE_PRESET`，包含 baseUrl、推荐模型名、API Key 管理页 URL。
- 在 `SettingsModal` 未配置态下，表单顶部展示一条 **GLM-4-Flash 推荐横幅**，含两个 CTA：
  - **一键预填**：自动填入 `provider=openai`、`baseUrl=GLM_FREE_PRESET.baseUrl`、`model=GLM_FREE_PRESET.model`，留空 API Key 由用户粘贴。
  - **去申请 API Key**：新标签页打开智谱开放平台的 API Key 管理页。
- 用户保存配置后横幅消失；清除配置后横幅恢复。
- `ResultsPage` 的 "尚未配置 AI 服务" 提示文案补一句"推荐使用免费的 GLM-4-Flash"。
- i18n 同步中英文新键（`glmBannerTitle` / `glmBannerBody` / `glmBannerApply` / `glmBannerGetKey`）。

**不做**：
- 不内置任何 API Key（Key 会被打进前端 bundle，等于公开泄漏）。
- 不搭建代理服务。
- 不改变任何已配置用户的既有行为与既有 provider 配置流程。
- 不再保留 Pollinations.ai 的试用通道代码。

## Capabilities

### Modified Capabilities
- `ai-model-config`: 在保留原有所有配置流程语义的基础上，新增"未配置态下提供 GLM-4-Flash 免费方案的一键引导"这一 UI 要求。

### New Capabilities
（无）

## Impact

- 受影响代码：
  - `src/services/aiConfig.ts`：新增 `GLM_FREE_PRESET` 常量。
  - `src/components/SettingsModal.tsx`：未配置态横幅 + 一键预填处理函数 + 注册链接。
  - `src/components/ResultsPage.tsx`：无结构变化，仅 i18n 文案变动。
  - `src/i18n/locales/{zh,en}/{results,settings}.json`：新增 4 个 key。
- 不影响：题库、历史存储、报告导出、CI 部署、移动端响应式。
- 依赖：无新增依赖。
- 风险：
  1. **`GLM_FREE_PRESET.signupUrl` 会随智谱平台路由调整**。缓解：URL 作为常量集中维护，一处可改；且"去申请 Key"只是引导链接，即使 404 用户也知道去首页找。
  2. **GLM-4-Flash 未来可能改变免费政策**。缓解：该常量名仅反映"当前首推的免费方案"，文案和 URL 可随时替换，不锁死品牌。
  3. **API Key 的获取流程仍需用户注册**。这是我们接受的代价——没有后端代理就无法做到"零配置自动可用"。
