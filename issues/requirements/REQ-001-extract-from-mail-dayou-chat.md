# REQ-001 · 从 mail-dayou-chat v0.1 抽出通用前端壳子

- **状态**: 已实施 (lead 自抽 · v0.1.0 待 PR + tag)
- **parent**: 老板 5-7 抽象决策 (mail-dayou v0.1 跑通 → 抽给所有 agent 复用)
- **base**: main (v0.0 骨架)

## 范围

### 抽

| 模块 | 源 | 关键改动 |
|---|---|---|
| `api.ts` | `mail-dayou-chat/src/api.ts` | 改成 `createApiClient(opts)` 工厂 · `apiBase / storagePrefix / prefix / userIdPrefix` 全可配 · 不再硬编 `dayou.user_id` |
| `useChat.tsx` | `mail-dayou-chat/src/App.tsx` (state + 处理函数) | 抽成 hook · 入参 `{welcome, client}` · 返 `{messages, sending, error, onSend, onTopicBreak, reload}` |
| `ChatShell.tsx` | `mail-dayou-chat/src/App.tsx` (整个 JSX) | 抽成组件 · agent 传 `title/subtitle/welcome/avatarFallback/avatarColor` 即可 |
| `index.ts` | 新 | 集中 export |

### 不抽

- `style.css` (Tailwind 4 全局 · 下游各自管)
- `vite.config.ts` (各仓自己 build)
- `.env.production` (各仓自己 deploy)
- agent 特有 WELCOME 文案 (各仓 props 传)

## acceptance

1. `tsc --noEmit` 通过 (类型干净)
2. ChatShell 默认 props 调通 (vite preview 跑起来不崩)
3. README 含完整接入示例 (≥ 3 行就跑起来)
4. CONTRACTS.md 列出 11 个下游仓 + 公开 API 全签名
5. 不依赖 mail-dayou 业务逻辑 (无 imap/smtp/邮箱等字眼)

## 流程

1. base 最新 main · 切 branch `req-001-extract`
2. 写 src/* (api / useChat / ChatShell / index)
3. README + CONTRACTS
4. tsc 类型检查
5. push + PR + merge + tag v0.1.0

## 不在范围

- 11 chat 仓切上来 (#133)
- v0.2 加自定义 footer slot 进阶 / 头像生成 / 等
