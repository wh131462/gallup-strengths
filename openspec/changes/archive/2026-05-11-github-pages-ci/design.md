## Context

项目是一个使用 Vite + React 19 + TypeScript 构建的 SPA（`gallup-strengths`），仓库地址为 `git@github.com:wh131462/gallup-strengths.git`，默认分支为 `master`。当前构建产物 `dist/` 仅本地生成，没有自动化发布。GitHub Pages 是最低成本的静态托管方案，且 GitHub Actions 已内置 Pages 部署官方 action 链。

## Goals / Non-Goals

**Goals:**
- 在 push 到 `master` 时自动构建并部署到 GitHub Pages
- 部署后可通过 `https://wh131462.github.io/gallup-strengths/` 访问
- 工作流幂等、可重复执行，失败可重跑
- 支持手动触发（`workflow_dispatch`）以便回滚或重新发布
- 缓存 npm 依赖以缩短 CI 时长

**Non-Goals:**
- 不实现 PR 预览部署（preview environments）
- 不配置自定义域名（CNAME）
- 不实现多环境部署（staging/production 分离）
- 不引入测试 / lint 强制门禁（项目当前无测试套件；`lint` 脚本仅做 `tsc --noEmit`，本次不强制纳入门禁，可作为单独变更）
- 不修改业务代码与路由实现

## Decisions

### Decision 1：使用 GitHub 官方 Pages Actions 而非 `peaceiris/actions-gh-pages`

采用 `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` 官方组合。

**Why**: 官方方案由 GitHub 维护，使用 OIDC 而非 PAT，无需配置 token，安全性更高；并且与 Pages "GitHub Actions" 源直接集成。

**Alternative considered**: `peaceiris/actions-gh-pages` 推送到 `gh-pages` 分支。被否决，因为需要 deploy key 或 PAT 管理，且产生噪音分支。

### Decision 2：在 `vite.config.ts` 中根据 `command` 设置 `base`

```ts
defineConfig(({ command }) => ({
  base: command === 'build' ? '/gallup-strengths/' : '/',
  ...
}))
```

**Why**: GitHub Pages 项目页托管在子路径 `/<repo>/`，资源引用必须带前缀。开发环境保留 `/` 以避免本地访问异常。

**Alternative considered**: 通过环境变量 `VITE_BASE` 注入。被否决，因为仓库名固定，引入额外环境变量增加复杂度且无收益。

### Decision 3：Node 版本固定为 20 LTS

**Why**: Vite 6 与项目依赖（React 19、Tailwind 4）均要求 Node ≥ 18，选择 20 LTS 稳定且长期支持。

### Decision 4：使用 `npm ci` 而非 `npm install`

**Why**: 项目存在 `package-lock.json`，`npm ci` 严格依赖 lockfile，构建可复现且更快。

### Decision 5：拆分 `build` 与 `deploy` 两个 job

**Why**: 符合官方 Pages 部署最佳实践（`deploy` job 必须使用 `github-pages` environment）。同时让产物上传与部署职责分离，便于调试。

## Risks / Trade-offs

- **[风险] 仓库重命名后 base 路径失效** → Mitigation：在 README 与工作流注释中标注 base 与仓库名的耦合关系；重命名时一并修改 `vite.config.ts`
- **[风险] Pages 源未切换为 GitHub Actions 导致首次部署失败** → Mitigation：tasks.md 中明确该一次性手动步骤；工作流首跑失败时引导用户检查 Settings → Pages
- **[风险] SPA 客户端路由直接访问子路径出现 404** → Mitigation：本次不引入路由；若后续引入，可通过 `404.html` 兜底（属于后续变更）
- **[风险] 大体积构建产物超出 Pages 限制（单产物 1GB / 站点 10GB）** → Mitigation：当前项目规模远低于限制，不需要额外措施

## Migration Plan

1. 合并工作流文件与 `vite.config.ts` 修改到 `master`
2. 在 GitHub 仓库 Settings → Pages 将 Source 设置为 "GitHub Actions"（一次性）
3. 首次 push 后工作流自动运行，验证 `https://wh131462.github.io/gallup-strengths/` 可访问

**Rollback**: 在 Pages 设置中将 Source 切回 "Deploy from a branch" 或禁用 Pages；revert 提交即可移除工作流。

## Open Questions

- 是否需要在 PR 上跑构建作为状态检查（不部署，仅验证可构建）？本次提案默认不包含，可作为后续小变更。
