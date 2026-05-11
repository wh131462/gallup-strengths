## Why

项目目前缺少自动化部署流程，每次构建发布需要手动执行 `vite build` 并上传产物。需要通过 GitHub Actions 实现 push 到主分支后自动构建并发布到 GitHub Pages，让访问者可直接通过 `https://wh131462.github.io/gallup-strengths/` 访问最新版本。

## What Changes

- 新增 `.github/workflows/deploy.yml` 工作流，在 push 到 `master`（默认分支）时触发自动构建与部署
- 工作流使用官方 `actions/deploy-pages` 将 `dist/` 产物部署到 GitHub Pages 环境
- 调整 `vite.config.ts`，在生产构建时设置 `base: '/gallup-strengths/'` 以匹配 GitHub Pages 子路径
- 在 GitHub 仓库 Settings → Pages 中将部署源切换为 GitHub Actions（一次性手动操作，工作流文档中说明）

## Capabilities

### New Capabilities
- `ci-deployment`: 通过 GitHub Actions 实现 SPA 自动构建与 GitHub Pages 发布的能力

### Modified Capabilities
<!-- 无现有 spec 受影响 -->

## Impact

- **新增文件**：`.github/workflows/deploy.yml`
- **修改文件**：`vite.config.ts`（生产环境 base 路径）
- **依赖**：不引入新的 npm 依赖，仅使用 GitHub Actions 官方 action（`actions/checkout`、`actions/setup-node`、`actions/configure-pages`、`actions/upload-pages-artifact`、`actions/deploy-pages`）
- **仓库设置**：需手动在 GitHub Pages 设置中将 Source 改为 "GitHub Actions"
- **路由影响**：若后续使用 client-side router，需要配合 base 路径设置
