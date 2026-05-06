# @akong/chat-shell · 对外契约 (CONTRACTS)

下游 chat 仓 import 表面 · 改这里 = 影响所有 11 个 chat 仓。

## 上游依赖

- `@akong/ui-react` (peer) · 提供 `ChatPage` + `Message` 类型
- `react` / `react-dom` ^19.0.0 (peer)

## 下游依赖 (谁用我)

| 仓 | 用我的什么 | 状态 |
|---|---|---|
| `mail-dayou-chat` | 整个 ChatShell + WELCOME 注入 | #133 |
| `hongniang-xiaoxi-chat` | 同上 | #133 |
| `hongniang-xiaoqiao-chat` | 同上 | #133 |
| `studio-xiaohua-chat` | 同上 | #133 |
| `kb-xiaozhi-chat` | 同上 | #133 |
| `cs-xiaoke-chat` | 同上 | #133 |
| `discovery-xiaoyan-chat` | 同上 | #133 |
| `discovery-dayan-chat` | 同上 | #133 |
| `fitness-xiaojian-chat` | 同上 | #133 |
| `ppt-xiaoxiu-chat` | 同上 | #133 |
| `brand-akong-chat` | 同上 (router) | #133 |

## 公开 API (改这里就要扫下游)

### `<ChatShell {...props} />`

见 README · 主要 props:
- `title` / `subtitle` / `welcome` (必)
- `avatarFallback` / `avatarColor` (推荐)
- `apiOpts.storagePrefix` (推荐 · 多 agent 同浏览器同名空间区分)

### `useChat({ welcome, client })`

- 入参: `{ welcome: string, client: ApiClient }`
- 返: `{ messages, sending, error, onSend, onTopicBreak, reload }`

### `createApiClient(opts)`

- `opts.apiBase` (默认从 `VITE_API_BASE` env)
- `opts.storagePrefix` (默认 "akong")
- `opts.prefix` (默认 "/api/chat")
- `opts.userIdPrefix` (默认 "anon-")
- 返 `ApiClient` (含 READY / userId / chat / loadHistory / markTopicBreak)

## backend 契约

要求 backend 实现 (akong-agent-base 自动满足):
- `POST {prefix}` · body `{text: string}` · 返 `{reply, used_tools}`
- `GET {prefix}/history` · 返 `BackendMessage[]`
- `POST {prefix}/topic-break` · 返 `{ok, marker_id}`
- 全部 endpoint require `X-User-ID` header (≥8 字)

## 浏览器 storage 契约

- key: `{storagePrefix}.user_id` (默认 `akong.user_id`)
- value: `{userIdPrefix}{32-char-uuid-no-dash}` (默认 `anon-...`)
- 第一次访问自动生成 · 一旦生成不变 (用户清缓存才重)

## 改动影响 SOP (lead 自检)

改任何 § 公开 API → 11 个下游 chat 仓 都要跟改。
backend 契约改 → 跟 akong-agent-base CONTRACTS 同步改。
storage key 改 → 老用户失忆 (要 migration · 慎重)。
