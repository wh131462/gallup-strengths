## Why

当前测试结果（`FinalResult` + 顾问报告）只在内存中保存，刷新或离开页面后即丢失，用户无法回看历史记录、也无法在多次测评之间进行对照。提供本地化的测试历史记录可以帮助用户追踪自身优势变化、复盘 AI 顾问报告，并在不依赖任何后端的前提下保护隐私。

## What Changes

- 测评完成后，自动将一次完整结果保存到浏览器 localStorage：包含时间戳、原始 answers、`topThemes`、`domainScores`、AI 顾问报告（若已生成）
- 在 LandingPage 增加「历史记录」入口（按钮 / 卡片列表），展示已保存的本地测评条目（时间、Top 1-3 主题摘要）
- 历史记录条目支持：查看（跳转到只读结果页）、删除单条、清空全部、导出 JSON
- ResultsPage：新增「保存到本地」按钮（默认自动保存一次，提供再次保存为快照的选项），并在顾问报告生成完成后自动更新当前条目
- 历史记录详情页复用 ResultsPage 渲染逻辑，但进入只读模式（不可重新作答；可重新生成 AI 报告并覆盖快照）
- 新增 i18n 文案（历史记录、保存、删除、清空、导出、空状态等）
- 提供存储上限保护（最多保留 N 条，超出按时间淘汰；JSON 序列化与版本号 schemaVersion）

## Capabilities

### New Capabilities
- `local-test-history`: 在浏览器本地持久化保存测评历史，支持浏览、对照、删除、导出

### Modified Capabilities
<!-- 无现有 spec 受影响 -->

## Impact

- 新增 `src/services/historyStorage.ts`：localStorage 读写、schema 版本、容量裁剪、导出
- 新增 `src/components/HistoryList.tsx`：历史列表 UI（在 LandingPage 中嵌入或作为弹窗）
- 修改 [src/App.tsx](src/App.tsx)：新增 `history` / `history-detail` 路由状态，传递选中的历史条目给 ResultsPage
- 修改 [src/components/ResultsPage.tsx](src/components/ResultsPage.tsx)：支持 readonly 模式，自动保存与快照更新
- 修改 [src/components/LandingPage.tsx](src/components/LandingPage.tsx)：增加历史记录入口与简要预览
- 新增 i18n keys：`src/i18n/locales/{zh,en}/history.json`（或合并到 common.json）
- 无后端 / API 变更；无 AI 服务层变更
- 隐私：所有数据仅保存在用户浏览器本地，不上传
