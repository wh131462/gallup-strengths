## ADDED Requirements

### Requirement: 多配置存储与 CRUD
系统 SHALL 支持在 localStorage 中保存多套完整 AI 配置（AIConfigProfile），每套包含唯一 id、名称、provider、baseUrl、apiKey、model。

#### Scenario: 新增配置
- **WHEN** 用户在 Settings 面板点击「新增配置」并填写完整字段后保存
- **THEN** 系统 MUST 生成唯一 id，将新配置追加到 profiles 列表并持久化到 localStorage

#### Scenario: 编辑配置
- **WHEN** 用户在列表中点击某配置的「编辑」按钮，修改字段后保存
- **THEN** 系统 MUST 更新该 id 对应的配置内容并持久化

#### Scenario: 删除配置
- **WHEN** 用户点击某配置的「删除」按钮并确认
- **THEN** 系统 MUST 从 profiles 列表中移除该配置并持久化

#### Scenario: 删除活动配置
- **WHEN** 用户删除当前活动配置
- **THEN** 系统 MUST 将 activeId 设为列表中剩余的第一条配置的 id；若列表为空则设为 null

#### Scenario: 配置上限
- **WHEN** 用户已保存 10 套配置并尝试新增
- **THEN** 系统 MUST 禁用新增按钮并显示已达上限提示

### Requirement: 活动配置切换
系统 SHALL 维护一个 activeId 标识当前活动配置，所有 AI 调用 MUST 使用活动配置。

#### Scenario: Settings 面板切换活动配置
- **WHEN** 用户在配置列表中点击某配置的「设为活动」按钮
- **THEN** 系统 MUST 将 activeId 更新为该配置的 id 并持久化

#### Scenario: 主界面快速切换
- **WHEN** 用户在主界面的快速切换下拉中选择另一配置
- **THEN** 系统 MUST 将 activeId 更新为所选配置的 id 并持久化，且不触发报告重新生成

#### Scenario: 重试时切换配置
- **WHEN** 报告生成失败后用户在重试界面选择另一配置并点击重试
- **THEN** 系统 MUST 使用所选配置（临时或切换活动）发起新的 AI 请求

#### Scenario: 无活动配置
- **WHEN** activeId 为 null（无任何配置）
- **THEN** `loadAIConfig()` MUST 返回 null，与当前未配置行为一致

### Requirement: 配置名称自动生成
系统 SHALL 在创建配置时自动生成名称，格式为 `{Provider 标签} / {model}`。

#### Scenario: 自动生成名称
- **WHEN** 用户新增配置且未手动修改名称字段
- **THEN** 系统 MUST 使用 `{Provider} / {model}` 格式作为配置名称

#### Scenario: 用户自定义名称
- **WHEN** 用户在名称字段中输入自定义文本
- **THEN** 系统 MUST 使用用户输入的名称，不覆盖为自动生成值

### Requirement: 旧配置自动迁移
系统 SHALL 在首次加载时检测旧 localStorage key（`gallup-strengths.ai-config`），若存在有效配置则自动迁移为新格式的第一条 profile 并设为活动。

#### Scenario: 存在旧配置
- **WHEN** 系统首次加载且 `gallup-strengths.ai-config` 存在有效 JSON
- **THEN** 系统 MUST 将其转换为 AIConfigProfile（生成 id 和名称），存入新 key，设为活动配置，并在旧 key 中标记 `_migrated: true`

#### Scenario: 旧配置已迁移
- **WHEN** 旧 key 中已包含 `_migrated: true` 标记
- **THEN** 系统 MUST NOT 重复迁移

#### Scenario: 无旧配置
- **WHEN** 旧 key 不存在或内容无效
- **THEN** 系统 MUST 初始化空的 profiles 列表
