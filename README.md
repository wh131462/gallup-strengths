# Strengths Navigator

> 专业的盖洛普优势评估与反馈系统，多维度解析个人核心竞争力。

基于盖洛普（Gallup）优势测评理论构建的纯前端 Web 应用：通过强制选择题采集偏好，量化四大领域（执行力 / 影响力 / 关系建立 / 战略思维）得分，识别个人 Top 主题，并可选接入 AI 模型生成深度优势报告。

---

## 功能特性

- **优势测评**：成对强制选择题，覆盖盖洛普 34 项主题与 4 大领域
- **多维结果可视化**：基于 Recharts 的领域得分图谱与 Top 主题展示
- **AI 顾问报告**（可选）：兼容 OpenAI / DeepSeek / 通义 / Moonshot / Ollama / Gemini OpenAI 端点 / Anthropic Claude
- **历史记录**：本地存储测评历史，支持回看与对比
- **国际化**：内置 中文 / English，基于 i18next 自动检测
- **明暗主题**：跟随系统或手动切换，刷新无闪烁
- **隐私优先**：测评数据与 AI 配置仅存储在浏览器 localStorage，不上传服务器

---

## 技术栈

- **框架**：React 19 + TypeScript + Vite 6
- **样式**：Tailwind CSS 4（@tailwindcss/vite）
- **图表**：Recharts 3
- **动画**：Motion（framer-motion 后继）
- **国际化**：i18next + react-i18next
- **Markdown**：react-markdown + remark-gfm
- **图标**：lucide-react

---

## 快速开始

环境要求：Node.js ≥ 18

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 类型检查
npm run lint

# 构建生产产物
npm run build

# 本地预览构建产物
npm run preview

# 清理 dist
npm run clean

# i18n 文案完整性检查
npm run check-i18n
```

---

## AI 顾问配置

应用本身不依赖 AI 即可完成测评。如需生成 AI 优势报告，请在「设置」中填写：

| 字段 | 说明 |
| --- | --- |
| Provider | `openai`（OpenAI 兼容协议）或 `anthropic`（Claude 原生协议） |
| Base URL | API 基础地址，例如 `https://api.openai.com/v1` |
| API Key | 对应平台的密钥 |
| Model | 模型 ID，可通过内置「拉取模型列表」获取 |

配置仅保存在本地 `localStorage`（key: `gallup-strengths.ai-config`），不会上传。

> Anthropic 直连浏览器需要平台允许 `anthropic-dangerous-direct-browser-access`，生产环境建议改为后端代理。

---

## 项目结构

```
src/
├── App.tsx                  # 路由与全局状态
├── main.tsx                 # 入口
├── constants.ts             # 题库 / 主题 / 领域映射
├── types.ts                 # 核心类型定义
├── components/              # 页面与 UI 组件
│   ├── LandingPage.tsx
│   ├── QuizPage.tsx
│   ├── ResultsPage.tsx
│   ├── HistoryList.tsx
│   ├── SettingsModal.tsx
│   ├── ReportReaderModal.tsx
│   └── ...
├── services/
│   ├── aiConfig.ts          # AI 配置与连通性测试
│   ├── aiService.ts         # 报告生成调用封装
│   └── historyStorage.ts    # 历史记录本地存储
├── hooks/useTheme.ts        # 明暗主题
├── i18n/                    # i18next 初始化与 zh/en 词条
└── index.css
```

---

## 数据存储

所有数据均保存在浏览器本地，清除浏览器数据将一并丢失：

- `app.theme`：主题偏好
- `gallup-strengths.ai-config`：AI 服务配置
- 历史测评记录：见 `services/historyStorage.ts`

---

## 体验

线上地址：<https://wh131462.github.io/gallup-strengths/>

## License

Apache-2.0
