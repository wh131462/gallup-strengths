## Why

当前系统仅支持保存一组 AI 配置（provider + baseUrl + apiKey + model）。用户如果同时使用多个服务（如 GLM 免费方案 + OpenAI 付费方案 + 本地 Ollama），每次切换都需要重新填写全部字段，体验差且容易出错。支持多套配置保存与快速切换可以显著降低使用摩擦。

## What Changes

- 将 localStorage 中的单一 `AIConfig` 扩展为 `AIConfigProfile[]` 列表，每条记录包含唯一 id、自动生成的名称（可编辑）、以及完整的 provider/baseUrl/apiKey/model 字段
- 新增「活动配置」概念，系统始终使用当前活动配置调用 AI
- Settings 面板改造为配置列表管理界面：支持新增、编辑、删除、切换活动配置
- 主界面（报告生成按钮附近）增加快速切换下拉，无需打开 Settings 即可切换
- 报告生成失败重试时支持选择另一配置再试
- 首次加载时自动将旧单一配置迁移为列表中的第一条（设为活动），保留旧 key 一段时间以便回滚

## Capabilities

### New Capabilities
- `multi-model-config`: 多套 AI 配置的存储、CRUD、活动切换、旧数据迁移

### Modified Capabilities
- `ai-model-config`: Settings 面板从单配置表单改为配置列表管理，新增列表视图、编辑/删除/切换操作

## Impact

- `src/services/aiConfig.ts` — 数据结构重构（AIConfig → AIConfigProfile[]），存储 key 变更，迁移逻辑
- `src/services/aiService.ts` — `loadAIConfig()` 调用方式不变（仍返回单个 AIConfig），但内部改为读取活动配置
- `src/components/SettingsModal.tsx` — 大幅改造为列表+编辑双视图
- `src/components/ResultsPage.tsx` — 新增快速切换下拉 & 重试时选择配置
- `src/i18n/locales/{zh,en}/settings.json` — 新增多配置相关文案
