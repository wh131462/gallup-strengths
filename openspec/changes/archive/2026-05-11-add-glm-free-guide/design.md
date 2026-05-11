# Design — add-glm-free-guide

## 背景

最初的方向是"内置免费通道 + 零配置开箱即用"（对应已废弃的 change `add-free-default-ai-trial`）。实测发现：

| 候选匿名端点 | 结果 |
|-------------|------|
| Pollinations.ai `text.pollinations.ai/openai` | 真实 prompt 下 Cloudflare 502 / >60s 超时 |
| Pollinations.ai GET 端点 | 能返回，但 ~50s；用户等不了 |
| HuggingFace 匿名 | 429 频繁、冷启动慢 |

结论：**在纯前端 + 无后端代理的约束下，"零配置免费可用"不可实现**。因此方案调整为"最低门槛引导"。

## 关键决策

### D1. 为什么是 GLM-4-Flash

- 对个人用户**完全免费**（不是试用额度，是永久免费层）
- **OpenAI 接口格式兼容**，无需修改 `aiService.callOpenAI` 逻辑
- 中文场景质量稳定（相比 Pollinations 的 GPT-OSS 20B）
- 注册门槛低（国内手机号即可）

### D2. 不把 GLM 做成独立 provider 选项

选择保留 `openai` / `anthropic` 两个 provider，GLM 走 `provider=openai` + 特定 baseUrl/model。原因：
- GLM 是 OpenAI 兼容，不需要独立调用链。
- 作为"推荐预设"而非"provider 分类"更贴合实际：它是 OpenAI 接口生态的一员，和 DeepSeek / Moonshot / Ollama 同类。
- 避免 provider 选项随推荐变化而膨胀。

### D3. 为什么不直接写死 API Key 到 CI/Secret

用户最初提议"用 GitHub Secret 注入 Key 到 CI"。这是不可行的——项目部署在 GitHub Pages（纯静态），Vite 在 build 时把环境变量替换成字面量写进 JS bundle，所以：

```
GitHub Secret → CI build → dist/assets/index-xxx.js 里出现 Key 明文
  → 任何人 curl 都能拿到 Key → 被刷爆 → 账号封禁
```

所以选择**引导用户注册自己的 Key**。Key 保存在用户浏览器 localStorage，不经过我们的任何基础设施。

### D4. 一键预填的交互范围

预填会填写：
- `provider` → `openai`
- `baseUrl` → `GLM_FREE_PRESET.baseUrl`
- `model` → `GLM_FREE_PRESET.model`
- **不自动清空已输入的 apiKey**——保留用户正在粘贴的 Key 内容；如果是刚进来的空态，apiKey 本身就是空的。

不预填的事：
- 不自动触发 `loadModels` 或 `testConnectivity`（避免在 Key 为空时打出一串无意义的错误请求）
- 不自动保存（用户还需要粘贴 Key 后点「保存」）

### D5. "去申请 API Key" 链接的脆弱性

`GLM_FREE_PRESET.signupUrl` 指向 `https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys`。该 URL 来源：智谱开放平台用户中心的 API Key 管理页，是当前最常见的入口路径。

风险：该路径可能随平台前端改版而失效。缓解：
- 常量集中维护在 `aiConfig.ts`，一处变更全局生效。
- 即使失效，用户点击后落到 404 或登录页，也能自己找到。并非阻塞性错误。

### D6. 横幅视觉风格

沿用项目既有的极简风格（`text-[10px] uppercase tracking-[0.3em]`、边框 + 浅底），但用 `amber` 色系区分于常规表单字段，暗示"提示/推荐"而非"错误/警告"。

不放进默认表单字段区（会喧宾夺主），而是独立横幅放在表单顶部。

## 不在本次范围内的事

- 不再维护 Pollinations 试用通道（代码回退为 change 之前的状态）。
- 不加第二个 / 第三个推荐服务（保持首屏简洁；如用户想用其他，走原有"手动输入 baseUrl/model"路径）。
- 不做"Key 有效性预检测"（已有「测试连通性」按钮承担该职责）。
- 不为 GLM 服务可用性做任何承诺（它挂了就挂了，用户可切换到其他 OpenAI 兼容服务）。
