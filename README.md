# @akong/chat-shell

阿空 agent chat 前端通用壳子 · 抽自 mail-dayou-chat v0.1。

## 用途

任何阿空 agent 的 chat 仓 (大邮 / 小喜 / 小巧 / 小知 / 小克 / 小张 / brand-akong / 等) 共享:
- `<ChatShell>` 组件 — 一句话挂出整个聊天页面 (header + 消息列表 + 输入框 + ⋮ 开新话题菜单 + footer)
- `useChat` hook — 高级用户自管 UI 时直接用 (state + onSend + onTopicBreak)
- `createApiClient` — 工厂 · agent 自传 apiBase / storagePrefix / endpoint prefix

后端契约: 配 [akong-agent-base](https://github.com/yarnovo/akong-agent-base) 的 `register_chat_routes` 自动通。

## 安装

下游 chat 仓 `package.json`:

```json
{
  "dependencies": {
    "@akong/chat-shell": "file:../akong-chat-shell",
    "@akong/ui-react": "file:../akong-ui-react",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

## 用法 (典型)

```tsx
// src/App.tsx
import { ChatShell } from "@akong/chat-shell"

const WELCOME = `你好 · 我是阿空大邮 · 邮箱管理大师。

你把邮箱挂上来 · 我帮你: 摘要收件箱 · 起草回信 · 写新信 · 整理。

发信前我都给你看草稿 · 你说"发"我才发。`

export default function App() {
  return (
    <ChatShell
      title="阿空大邮"
      subtitle="邮箱管理大师"
      welcome={WELCOME}
      avatarFallback={<span className="text-base">📬</span>}
      avatarColor="hsl(220 30% 25%)"
      apiOpts={{ storagePrefix: "dayou" }}
    />
  )
}
```

`apiBase` 默认从 `import.meta.env.VITE_API_BASE` 读 · `.env.production` 配:

```
VITE_API_BASE=https://api.dayou.mail.agentaily.com
```

## 用法 (高级 · 自管 UI)

```tsx
import { useChat, createApiClient } from "@akong/chat-shell"

const client = createApiClient({ storagePrefix: "myagent" })

function MyCustomChat() {
  const { messages, sending, error, onSend, onTopicBreak } = useChat({
    welcome: "...",
    client,
  })
  return <div>...</div>
}
```

## API

### `<ChatShell>` props

| prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` | `string` | — | header 标题 (例 "阿空大邮") |
| `subtitle` | `string` | — | header 副标题 (例 "邮箱管理大师") |
| `welcome` | `string` | — | 启动第一条消息 (前端 sentinel · 不存 backend) |
| `avatarFallback` | `ReactNode` | — | header 头像 fallback (emoji 或图) |
| `avatarColor` | `string` | — | 头像底色 (HSL) |
| `client` | `ApiClient` | 自动 | 自定义 api client (高级 · 不传则用 `createApiClient(apiOpts)`) |
| `apiOpts` | `ApiClientOpts` | `{}` | 传给 `createApiClient` |
| `footerExtras` | `ReactNode` | — | footer 加内容 |
| `topicBreakLabel` | `string` | `开新话题` | ⋮ 菜单文案 |

### `createApiClient(opts)` 选项

| opt | 默认 | 说明 |
|---|---|---|
| `apiBase` | `import.meta.env.VITE_API_BASE` | backend 根 URL |
| `storagePrefix` | `akong` | localStorage key 前缀 (`{prefix}.user_id`) |
| `prefix` | `/api/chat` | backend 路由 prefix |
| `userIdPrefix` | `anon-` | 新建匿名 user_id 前缀 |

### `useChat({ welcome, client })`

返 `{ messages, sending, error, onSend, onTopicBreak, reload }`.

### 类型

```ts
type BackendMessage = {
  id: number
  role: "user" | "assistant" | "system"
  content: string
  topic_break: boolean
  created_at: number
}

type ChatResp = {
  reply: string
  used_tools: { name: string; args: unknown; result: unknown }[]
}
```

## 状态

- [x] v0.1 抽出 ChatShell + useChat + createApiClient
- [ ] mail-dayou-chat 切上来 (#133)
- [ ] 其他 10 chat 仓切 (#133)

## License

Internal · 阿空智能科技。
