## 1. 配置 Vite base 路径

- [x] 1.1 修改 `vite.config.ts`，根据 `command` 在 `build` 时设置 `base: '/gallup-strengths/'`，其它情况保持 `/`
- [x] 1.2 本地执行 `npm run build`，检查 `dist/index.html` 中资源路径以 `/gallup-strengths/` 开头
- [x] 1.3 本地执行 `npm run dev`，确认开发模式仍在根路径正常工作

## 2. 创建 GitHub Actions 工作流

- [x] 2.1 新建 `.github/workflows/deploy.yml` 文件
- [x] 2.2 配置触发条件：`push` 到 `master` 分支 + `workflow_dispatch`
- [x] 2.3 配置 `permissions`：`contents: read`、`pages: write`、`id-token: write`
- [x] 2.4 配置 `concurrency`：group `pages`，`cancel-in-progress: true`
- [x] 2.5 定义 `build` job：checkout → setup-node@v4（node 20，启用 npm cache）→ `npm ci` → `npm run build` → `actions/configure-pages@v5` → `actions/upload-pages-artifact@v3`（path: `./dist`）
- [x] 2.6 定义 `deploy` job：`needs: build`、`environment: github-pages`（含 `url` 输出）→ `actions/deploy-pages@v4`

## 3. 仓库设置（一次性手动操作）

- [x] 3.1 在 GitHub 仓库 Settings → Pages 中将 Source 设置为 "GitHub Actions"
- [x] 3.2 确认默认分支为 `master`（与工作流触发分支一致）

## 4. 验证部署

- [x] 4.1 将变更提交并 push 到 `master`
- [x] 4.2 在 Actions 页面观察工作流运行，确认 `build` 与 `deploy` 两个 job 均成功
- [x] 4.3 访问 `https://wh131462.github.io/gallup-strengths/`，确认页面加载且静态资源（JS/CSS）请求 200
- [x] 4.4 验证 `workflow_dispatch` 手动触发可正常执行

## 5. 文档

- [x] 5.1 在 `README.md` 中添加部署说明小节，包含线上地址与 Pages 源配置步骤
