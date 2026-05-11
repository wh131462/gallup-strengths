## Context

Strengths Navigator 是一个纯前端的优势测评应用（React + Vite，无后端）。当前测评流程：LandingPage → QuizPage → ResultsPage（基于 `answers` 计算 `topThemes` 与 `domainScores`，可选请求 AI 顾问报告）。测评结果仅以 React 内存状态存在，刷新即丢失。AI 配置已使用 localStorage（`src/services/aiConfig.ts`）作为先例。

约束：
- 必须保持纯前端，不引入后端 / 远端存储
- 必须支持中英文 i18n（已有 `react-i18next` 体系）
- 必须支持深色模式（已有 `useTheme`）
- 浏览器 localStorage 容量约 5MB；AI 报告 Markdown 可能较长（数 KB - 数十 KB）

## Goals / Non-Goals

**Goals:**
- 自动持久化每次完成的测评结果，包含 AI 顾问报告
- 提供历史列表 UI，可查看、删除、清空、导出
- 支持「对照」场景：用户能并排查看两次测评的主题与得分差异（MVP 阶段先做单条只读查看，对照视图可作为下一步）
- 数据格式带版本号，便于未来 schema 演进
- 完全本地化、隐私友好（不上传）

**Non-Goals:**
- 跨设备 / 云端同步
- 多用户账号体系
- 历史条目之间的高级分析（趋势图、统计），可后续迭代
- 在初版中支持加密存储

## Decisions

### 1. 存储方案：localStorage（单 key + JSON 数组）
- 使用单一 key `strengths-navigator:test-history`，存储 `{ version, entries: HistoryEntry[] }`
- 备选：IndexedDB —— 容量更大、异步 API，但对当前数据量（最多 50 条 × 几十 KB）过度设计；localStorage 与现有 `aiConfig.ts` 风格一致
- 备选：每条一个 key —— 列表读取需要遍历，且容易与其他 key 冲突

### 2. Schema 与版本
```ts
interface HistoryEntry {
  id: string;            // uuid / timestamp-based
  createdAt: number;     // ms epoch
  updatedAt: number;
  language: 'zh' | 'en'; // 测评时的语言（影响主题名展示）
  answers: Record<string, number>;
  topThemes: StrengthTheme[];
  domainScores: Record<StrengthDomain, number>;
  advisorReport?: {
    markdown: string;
    model?: string;
    generatedAt: number;
  };
  note?: string;         // 用户可选备注（如「2024 Q1」），便于对照
}

interface HistoryStore {
  version: 1;
  entries: HistoryEntry[]; // 按 createdAt 倒序
}
```
版本号便于未来迁移；读取时若 version 不匹配，走 `migrate(store)` 或安全清空并提示。

### 3. 容量策略
- 上限：默认保留最近 50 条；超出按 `createdAt` 升序裁剪
- 写入失败（QuotaExceededError）：捕获并尝试裁剪一半后重试一次；仍失败则提示用户导出后清理

### 4. 自动保存时机
- ResultsPage 挂载并完成本地计算后，立即创建一条 `HistoryEntry` 并保存（记录 `id` 在 state）
- AI 顾问报告生成完成后，按 `id` 更新对应条目（合并 `advisorReport`，刷新 `updatedAt`）
- 用户可点击「另存为快照」生成新 `id`（保留旧版本，便于对照）

### 5. 路由 / 导航
- 当前 App 使用 `AppState = 'landing' | 'quiz' | 'results'` 的本地 state；扩展为 `'landing' | 'quiz' | 'results' | 'history'`
- 历史详情：复用 `ResultsPage`，新增 props `readonly?: boolean` 与 `entry?: HistoryEntry`；当传入 `entry` 时跳过计算，直接渲染
- 不引入 react-router（保持轻量，与现有风格一致）

### 6. ResultsPage readonly 模式
- `readonly=true` 时：隐藏「重新测评」入口或将其改为「返回历史」；AI 报告区域显示已保存内容；提供「重新生成 AI 报告」按钮（覆盖���照内 advisorReport）
- 非 readonly 模式行为不变（保持现有自动保存逻辑）

### 7. 导出 / 导入
- 导出：将整个 `HistoryStore` 序列化为 JSON 下载（Blob + a[download]）
- 导入：MVP 不做（避免恶意 JSON 注入 / 校验复杂度），列入 Open Questions

### 8. i18n
- 新增 namespace `history`（`src/i18n/locales/{zh,en}/history.json`）
- 在 `src/i18n/index.ts` 注册 namespace
- 时间显示使用 `Intl.DateTimeFormat(locale)`，跟随当前 i18n 语言

## Risks / Trade-offs

- [localStorage 容量上限 ~5MB] → 50 条上限 + 写入失败时裁剪重试 + 导出建议；AI 报告文本可考虑后续做 LZ 压缩（暂不做）
- [无后端，清缓存即丢失] → 提供 JSON 导出作为备份路径；UI 文案明确告知「仅本地」
- [多语言下主题名差异] → entry 记录 `language` 字段，详情页按 entry.language 展示主题文案；对照场景下若语言不同，需在 UI 上提示
- [readonly 模式改造 ResultsPage 增加组件复杂度] → 通过最小 props 扩展（`readonly`、`entry`）避免分裂出第二个组件；如复杂度抬升再拆分
- [自动保存可能产生大量「半成品」条目（用户随手点开测评但未完成 AI 报告）] → 仅在 Quiz 完整完成后保存；自动保存的条目允许后续被 AI 报告更新而非新增
- [删除 / 清空操作不可逆] → 二次确认弹窗

## Migration Plan

- 首次发布即引入，无旧数据；`historyStorage.load()` 读到空时返回 `{ version: 1, entries: [] }`
- 未来 schema 变更：在 `historyStorage.ts` 内集中维护 `migrate(oldStore)`；不破坏旧数据，失败则降级为空 + 控制台警告
- 无回滚需求（纯前端、单文件 key）；如需禁用功能，下线 UI 入口即可，已存数据不会影响其他功能

## Open Questions

- 是否允许从 JSON 导入恢复历史？（涉及校验与 schema 验证）
- 「对照视图」（两条记录并排 diff）是放入本变更还是单独提案？当前倾向单独提案，本变更仅交付列表 + 只读详情
- 是否需要给每条记录加自定义标签 / 备注的编辑入口？MVP 保留 `note` 字段，UI 可在后续迭代加入
