// 通用 chat API 工厂 · 每个 agent 自传 apiBase + storagePrefix
//
// backend 契约 (akong-agent-base routes):
//   POST {prefix}            : {text} → {reply, used_tools}
//   GET  {prefix}/history    : list[BackendMessage]
//   POST {prefix}/topic-break: {ok, marker_id}
//
// X-User-ID header 必带 · backend 走 require_user 校验 (≥8 字)

export interface BackendMessage {
  id: number
  role: "user" | "assistant" | "system"
  content: string
  topic_break: boolean
  created_at: number
}

export interface ChatResp {
  reply: string
  used_tools: { name: string; args: unknown; result: unknown }[]
}

export interface ApiClient {
  READY: boolean
  apiBase: string
  userId: () => string
  chat: (text: string) => Promise<ChatResp>
  loadHistory: () => Promise<BackendMessage[]>
  markTopicBreak: () => Promise<{ ok: boolean; marker_id: number }>
}

export interface ApiClientOpts {
  apiBase?: string          // default: import.meta.env.VITE_API_BASE
  storagePrefix?: string    // default: "akong" · 控 localStorage key 前缀
  prefix?: string           // default: "/api/chat" · backend 路由 prefix
  userIdPrefix?: string     // default: "anon-" · 新 user_id 前缀
}

export function createApiClient(opts: ApiClientOpts = {}): ApiClient {
  const apiBase = opts.apiBase ?? (
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_API_BASE as string | undefined) ?? ""
      : ""
  )
  const storagePrefix = opts.storagePrefix ?? "akong"
  const userIdKey = `${storagePrefix}.user_id`
  const userIdPrefix = opts.userIdPrefix ?? "anon-"
  const prefix = opts.prefix ?? "/api/chat"
  const READY = !!apiBase

  function getOrCreateUserId(): string {
    let id = localStorage.getItem(userIdKey)
    if (!id) {
      id = userIdPrefix + crypto.randomUUID().replace(/-/g, "")
      localStorage.setItem(userIdKey, id)
    }
    return id
  }

  async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    if (!READY) {
      throw Object.assign(new Error("agent 后端建设中"), { kind: "backend_not_ready" })
    }
    const res = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": getOrCreateUserId(),
        ...(init.headers || {}),
      },
    })
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new Error(detail.detail || `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  }

  return {
    READY,
    apiBase,
    userId: getOrCreateUserId,
    chat: (text) => api<ChatResp>(prefix, { method: "POST", body: JSON.stringify({ text }) }),
    loadHistory: () => api<BackendMessage[]>(`${prefix}/history`),
    markTopicBreak: () => api<{ ok: boolean; marker_id: number }>(`${prefix}/topic-break`, { method: "POST" }),
  }
}
