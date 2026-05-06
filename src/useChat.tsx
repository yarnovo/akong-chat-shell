// useChat hook · 抽自 mail-dayou-chat App.tsx
//
// 提供 chat 全部 state + 方法 · 不挂 UI · 高级用户可以用 ChatShell 之外的 UI 套上来。
//
// WELCOME sentinel pattern (老板 5-7 拍): WELCOME 不存 backend · 永远第一条 · 用户每次进都看见

import * as React from "react"
import type { Message } from "@akong/ui-react"
import { type ApiClient, type BackendMessage } from "./api"

function fmtTime(ts: number) {
  return new Date(ts * 1000).toTimeString().slice(0, 5)
}

function backendToFront(m: BackendMessage): Message {
  const role: Message["role"] =
    m.role === "user" ? "user" : (m.role === "assistant" ? "agent" : "system")
  return {
    id: m.id,
    role,
    content: m.content,
    timestamp: fmtTime(m.created_at),
  }
}

export interface UseChatOpts {
  welcome: string
  client: ApiClient
}

export interface UseChatResult {
  messages: Message[]
  sending: boolean
  error: string
  onSend: (text: string) => Promise<void>
  onTopicBreak: () => Promise<void>
  reload: () => Promise<void>
}

export function useChat({ welcome, client }: UseChatOpts): UseChatResult {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState("")
  const tmpIdRef = React.useRef(-1)

  const welcomeMsg: Message = React.useMemo(() => ({
    id: 0,
    role: "agent",
    content: welcome,
    timestamp: new Date().toTimeString().slice(0, 5),
  }), [welcome])

  const reload = React.useCallback(async () => {
    if (!client.READY) {
      setMessages([welcomeMsg])
      return
    }
    try {
      const hist = await client.loadHistory()
      setMessages([welcomeMsg, ...hist.map(backendToFront)])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setMessages([welcomeMsg])
    }
  }, [client, welcomeMsg])

  React.useEffect(() => {
    void reload()
  }, [reload])

  const onSend = React.useCallback(async (text: string) => {
    setError("")
    const tmpId = tmpIdRef.current--
    setMessages((ms) => [
      ...ms,
      { id: tmpId, role: "user", content: text, timestamp: new Date().toTimeString().slice(0, 5) },
    ])
    setSending(true)
    try {
      await client.chat(text)
      const hist = await client.loadHistory()
      setMessages([welcomeMsg, ...hist.map(backendToFront)])
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      setError(m)
      setMessages((ms) => [
        ...ms,
        { id: tmpIdRef.current--, role: "agent", content: "出错: " + m, timestamp: new Date().toTimeString().slice(0, 5) },
      ])
    } finally {
      setSending(false)
    }
  }, [client, welcomeMsg])

  const onTopicBreak = React.useCallback(async () => {
    if (!client.READY) return
    try {
      await client.markTopicBreak()
      const hist = await client.loadHistory()
      setMessages([welcomeMsg, ...hist.map(backendToFront)])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [client, welcomeMsg])

  return { messages, sending, error, onSend, onTopicBreak, reload }
}
