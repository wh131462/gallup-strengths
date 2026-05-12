# AI Model Config

## Purpose

配置面板用于管理 AI provider 接入参数（provider 类型、baseUrl、apiKey、model），并在保存前帮助用户发现可用模型与验证连通性。

## Requirements

### Requirement: 模型列表动态获取
配置面板 SHALL 在 OpenAI 兼容 provider 下，根据当前 baseUrl 与 apiKey 自动调用 `GET {baseUrl}/models` 获取模型列表，并将结果作为模型字段下拉选项呈现。

#### Scenario: 成功获取模型列表
- **WHEN** 用户已选择 OpenAI 兼容 provider，填入有效的 baseUrl 和 apiKey，并触发 baseUrl 或 apiKey 字段失焦
- **THEN** 系统 MUST 在 10 秒内发起 `GET {baseUrl}/models` 请求，解析响应中的 `data[].id` 并将其作为下拉选项展示

#### Scenario: 接口不可用降级
- **WHEN** `GET {baseUrl}/models` 返回 4xx/5xx 或网络失败
- **THEN** 系统 MUST 在模型字段旁显示「无法获取模型列表，可手动输入」的提示，并保留输入能力

#### Scenario: Anthropic provider 使用静态候选
- **WHEN** 用户选择 Anthropic provider
- **THEN** 模型字段的下拉 MUST 展示内置候选（包含 `claude-3-5-sonnet-latest`、`claude-3-5-haiku-latest`、`claude-3-opus-latest`），且不发起任何模型列表网络请求

#### Scenario: 触发刷新
- **WHEN** 用户点击模型字段旁的「刷新」按钮（仅 OpenAI 兼容 provider）
- **THEN** 系统 MUST 重新调用 `GET {baseUrl}/models` 并更新下拉选项

### Requirement: 自定义模型输入
模型字段 SHALL 在任何 provider 下都允许用户输入下拉列表外的自定义模型 ID，输入值在保存时按字面量写入配置。

#### Scenario: 输入未在列表中的模型
- **WHEN** 用户在模型字段中输入一个不在下拉选项中的字符串并点击保存
- **THEN** 系统 MUST 接受该值并将其作为 `model` 字段持久化到 localStorage

### Requirement: 连通性测试
配置面板 SHALL 提供独立的「测试连通性」按钮，用于在保存前验证当前 provider、baseUrl、apiKey、model 组合是否可用。

#### Scenario: 测试通过
- **WHEN** 用户点击「测试连通性」且当前配置可成功调用 provider
- **THEN** 按钮旁 MUST 显示成功状态（含视觉标记，如绿色指示与文案）

#### Scenario: 鉴权失败
- **WHEN** provider 返回 HTTP 401 或 403
- **THEN** 系统 MUST 显示「鉴权失败」类错误提示

#### Scenario: baseUrl 错误
- **WHEN** provider 返回 HTTP 404 或域名解析失败
- **THEN** 系统 MUST 显示「baseUrl 不正确或服务不可达」类错误提示

#### Scenario: 网络/CORS 错误
- **WHEN** fetch 抛出 TypeError（典型为 CORS 阻断或网络不可达）
- **THEN** 系统 MUST 显示「无法连接，可能为 CORS 或网络问题」类错误提示

#### Scenario: 测试期间 UI 状态
- **WHEN** 用户点击「测试连通性」后请求尚未完成
- **THEN** 按钮 MUST 进入加载态并禁用以防止重复点击；请求 MUST 在 10 秒内被 AbortController 中止并显示超时提示

#### Scenario: 必填项缺失
- **WHEN** 用户在 baseUrl、apiKey 或 model 任一为空时点击「测试连通性」
- **THEN** 「测试连通性」按钮 MUST 处于禁用状态

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
