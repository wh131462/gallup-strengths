## ADDED Requirements

### Requirement: 自动构建与部署到 GitHub Pages

系统 SHALL 在代码推送到默认分支 `master` 时自动构建产物并发布到 GitHub Pages，使站点可通过 `https://wh131462.github.io/gallup-strengths/` 访问。

#### Scenario: push 到 master 触发部署
- **WHEN** 开发者将提交推送到 `master` 分支
- **THEN** GitHub Actions 工作流自动启动，执行 `npm ci` 与 `npm run build`，并将 `dist/` 作为 Pages artifact 部署
- **AND** 部署成功后，工作流摘要显示已部署的页面 URL

#### Scenario: 构建失败时不部署
- **WHEN** `npm run build` 因类型错误或依赖问题失败
- **THEN** 工作流在 `build` job 失败并终止
- **AND** `deploy` job 不被执行，GitHub Pages 上的现有版本保持不变

### Requirement: 支持手动触发部署

系统 SHALL 支持通过 GitHub Actions UI 手动触发部署工作流，以便在无新提交时重新发布或回滚。

#### Scenario: 通过 workflow_dispatch 重新部署
- **WHEN** 维护者在 Actions 页面选择 "Run workflow" 并指定分支
- **THEN** 工作流以该分支当前 HEAD 执行完整的构建与部署流程

### Requirement: 生产构建使用正确的 base 路径

系统 SHALL 在生产构建（`vite build`）时使用 `/gallup-strengths/` 作为资源 base 路径，开发模式保留 `/`。

#### Scenario: 生产构建产物引用子路径资源
- **WHEN** 执行 `npm run build`
- **THEN** 生成的 `dist/index.html` 中 `<script>` 与 `<link>` 标签的资源路径以 `/gallup-strengths/` 开头

#### Scenario: 开发模式使用根路径
- **WHEN** 执行 `npm run dev`
- **THEN** Vite dev server 在 `/` 根路径下提供资源，本地访问 `http://localhost:3000/` 正常工作

### Requirement: 并发部署互斥

系统 SHALL 通过 concurrency group 限制同一时刻仅运行一次 Pages 部署，避免新旧部署相互覆盖产生不确定的最终状态。

#### Scenario: 短时间内连续 push 时旧运行被取消
- **WHEN** 在前一次部署仍在进行中时再次 push 到 `master`
- **THEN** 旧的工作流运行被取消，新的运行接管部署
- **AND** 最终 Pages 上的内容为最新一次 push 的构建结果

### Requirement: 依赖缓存

工作流 SHALL 缓存 npm 依赖以减少重复下载，缩短 CI 执行时间。

#### Scenario: 命中 npm 缓存
- **WHEN** `package-lock.json` 未发生变化的连续运行
- **THEN** `actions/setup-node` 的内置 npm 缓存命中，`npm ci` 在数秒内完成
