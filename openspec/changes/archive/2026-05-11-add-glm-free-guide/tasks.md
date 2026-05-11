# Tasks — add-glm-free-guide

## 1. 服务层：GLM 预设常量

- [x] 1.1 在 `src/services/aiConfig.ts` 新增 `GLM_FREE_PRESET` 常量（`baseUrl`、`model`、`signupUrl`）。
- [x] 1.2 导出该常量供 UI 层引用。

## 2. SettingsModal：推荐横幅 UI

- [x] 2.1 在 `SettingsModal` 打开时，若 `loadAIConfig() === null` 则置 `notConfigured = true`，否则为 `false`。
- [x] 2.2 用户保存配置后把 `notConfigured` 置为 `false`；清除配置后置为 `true`。
- [x] 2.3 `notConfigured === true` 时，表单顶部渲染 GLM 推荐横幅：标题 + 说明 + 两个 CTA 按钮。
- [x] 2.4 「一键预填」按钮调用 `handleApplyGlmPreset`：写入 `provider=openai`、`baseUrl/model` 来自 `GLM_FREE_PRESET`；不清空已有 `apiKey`；重置 `modelOptions` 和测试状态。
- [x] 2.5 「去申请 API Key」为 `<a>` 元素，`target="_blank" rel="noopener noreferrer"`，href 指向 `GLM_FREE_PRESET.signupUrl`。

## 3. ResultsPage：needsConfig 文案提示

- [x] 3.1 `ResultsPage` 代码结构保持不变；通过 i18n 在 `results.needsConfig` 文案中补一句"推荐使用免费的 GLM-4-Flash"。

## 4. i18n

- [x] 4.1 `src/i18n/locales/{zh,en}/settings.json` 新增 keys：`glmBannerTitle`、`glmBannerBody`、`glmBannerApply`、`glmBannerGetKey`。
- [x] 4.2 `src/i18n/locales/{zh,en}/results.json` 更新 `needsConfig` 文案。
- [x] 4.3 运行 `npm run check-i18n` 确保键齐全。

## 5. 回退 Pollinations 试用通道代码

- [x] 5.1 移除 `src/services/aiConfig.ts` 中的 `TRIAL_CONFIG`、`getEffectiveAIConfig`、`AIConfig.isTrial`。
- [x] 5.2 还原 `src/services/aiService.ts`：改回 `loadAIConfig()`、保留 `AIConfigError` 抛出、还原 `callOpenAI` 总是附带 `Authorization` 的分支。
- [x] 5.3 还原 `src/components/ResultsPage.tsx`：移除 `isTrialReport` state、徽标 UI、`trialHint` 块。
- [x] 5.4 i18n 中移除 `trialBadge`、`trialHint`（results）与 `trialBannerTitle`、`trialBannerBody`（settings）。

## 6. 验证

- [x] 6.1 `npm run check-i18n` 通过。
- [x] 6.2 `npm run build` 通过。
- [x] 6.3 手动验证（需本地 `npm run dev`）：
  - 未配置态：Settings 顶部出现 GLM 横幅；点「一键预填」后 baseUrl 与 model 变成 GLM 值；点「去申请」新标签页打开智谱。
  - 粘贴有效 GLM Key → 测试连通性通过 → 保存 → 横幅消失。
  - 未配置态在 ResultsPage 生成报告：显示 needsConfig 提示（含 GLM 推荐文案）+「打开 AI 设置」按钮。
  - 已配置态：Settings 打开时横幅不显示；行为完全与改动前一致。
  - 在 Settings 点「清除本地配置」后横幅恢复出现。
