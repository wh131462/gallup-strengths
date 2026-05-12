## MODIFIED Requirements

### Requirement: 未配置态提供免费方案引导
当用户尚未保存任何 AI 配置时，配置面板 SHALL 在配置列表顶部显示一条推荐横幅，向用户提供一个免费、稳定、OpenAI 兼容方案（当前推荐 GLM-4-Flash）的一键预填入口以及 API Key 申请链接，以降低首次配置门槛。

#### Scenario: 未配置态显示 GLM 推荐横幅
- **WHEN** 用户打开 Settings 模态框且配置列表为空
- **THEN** 列表顶部 MUST 展示 GLM 推荐横幅，含标题、说明文案、「一键预填」按钮、「去申请 API Key」外链

#### Scenario: 一键预填自动进入编辑视图
- **WHEN** 用户在未配置态下点击「一键预填」按钮
- **THEN** 系统 MUST 进入编辑视图，并将 provider 设为 `openai`、baseUrl 设为 GLM 推荐地址、model 设为 GLM 推荐免费模型名，apiKey 留空待用户填写

#### Scenario: 去申请 API Key 打开外部页面
- **WHEN** 用户点击「去申请 API Key」
- **THEN** 浏览器 MUST 在新标签页打开 GLM 开放平台的 API Key 管理入口（`target="_blank"` + `rel="noopener noreferrer"`）

#### Scenario: 已有配置时不显示推荐横幅
- **WHEN** 用户打开 Settings 且配置列表非空
- **THEN** 横幅 MUST NOT 被渲染

#### Scenario: 清除所有配置后横幅恢复
- **WHEN** 用户删除所有配置使列表为空
- **THEN** 横幅 MUST 再次渲染

## ADDED Requirements

### Requirement: Settings 面板配置列表视图
Settings 面板 SHALL 以列表形式展示所有已保存的 AI 配置，每条显示名称、provider 类型、model 名称，并提供操作按钮。

#### Scenario: 展示配置列表
- **WHEN** 用户打开 Settings 面板且存在已保存配置
- **THEN** 面板 MUST 以卡片/行列表形式展示所有配置，每条显示名称、provider 标签、model，活动配置 MUST 有视觉标记

#### Scenario: 从列表进入编辑
- **WHEN** 用户点击某配置的「编辑」按钮
- **THEN** 面板 MUST 切换到编辑视图，表单预填该配置的所有字段

#### Scenario: 从列表新增配置
- **WHEN** 用户点击「新增配置」按钮
- **THEN** 面板 MUST 切换到编辑视图，表单为空白（使用 provider 默认值预填）

#### Scenario: 编辑视图返回列表
- **WHEN** 用户在编辑视图点击「取消」或保存成功
- **THEN** 面板 MUST 返回列表视图
