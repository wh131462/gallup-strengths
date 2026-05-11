# ai-model-config — Spec Delta

## ADDED Requirements

### Requirement: 未配置态提供免费方案引导
当用户尚未保存任何 AI 配置时，配置面板 SHALL 在表单顶部显示一条推荐横幅，向用户提供一个免费、稳定、OpenAI 兼容方案（当前推荐 GLM-4-Flash）的一键预填入口以及 API Key 申请链接，以降低首次配置门槛。

#### Scenario: 未配置态显示 GLM 推荐横幅
- **WHEN** 用户打开 Settings 模态框且 `loadAIConfig()` 返回 `null`
- **THEN** 表单顶部 MUST 展示 GLM 推荐横幅，含标题、说明文案、「一键预填」按钮、「去申请 API Key」外链

#### Scenario: 一键预填自动写入推荐配置
- **WHEN** 用户在未配置态下点击「一键预填」按钮
- **THEN** 系统 MUST 把当前 `provider` 设为 `openai`、`baseUrl` 设为 GLM 推荐的开放平台地址、`model` 设为 GLM 推荐免费模型名
- **AND** 系统 MUST NOT 清空用户已输入的 `apiKey`
- **AND** 系统 MUST NOT 自动触发模型列表获取或连通性测试

#### Scenario: 去申请 API Key 打开外部页面
- **WHEN** 用户点击「去申请 API Key」
- **THEN** 浏览器 MUST 在新标签页打开 GLM 开放平台的 API Key 管理入口（`target="_blank"` + `rel="noopener noreferrer"`）

#### Scenario: 已配置态不显示推荐横幅
- **WHEN** 用户打开 Settings 且已保存有效配置
- **THEN** 横幅 MUST NOT 被渲染

#### Scenario: 清除配置后横幅恢复
- **WHEN** 用户点击「清除本地配置」
- **THEN** 横幅 MUST 再次渲染（与未配置态一致）

#### Scenario: 保存配置后横幅消失
- **WHEN** 用户保存了一份有效配置
- **THEN** 下次打开 Settings 时横幅 MUST NOT 被渲染

## MODIFIED Requirements

（无现有 Requirement 的语义被修改；新增项与既有 Requirement 并存。）
