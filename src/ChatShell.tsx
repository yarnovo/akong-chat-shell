// ChatShell · 一句话挂出整个 agent chat 页面
//
// 用法 (典型):
//   <ChatShell
//     title="阿空大邮"
//     subtitle="邮箱管理大师"
//     welcome="你好 · 我是大邮 ..."
//     avatarFallback="📬"
//     avatarColor="hsl(220 30% 25%)"
//   />
//
// 高级 (传自定义 client / footerExtras):
//   const client = createApiClient({ apiBase: "...", storagePrefix: "dayou" })
//   <ChatShell ... client={client} footerExtras={<span>buy me a coffee</span>} />

import * as React from "react"
import { ChatPage, type Message } from "@akong/ui-react"
import { type ApiClient, type ApiClientOpts, createApiClient } from "./api"
import { useChat } from "./useChat"

export interface ChatShellProps {
  title: string
  subtitle: string
  welcome: string
  avatarFallback?: React.ReactNode
  avatarColor?: string
  client?: ApiClient
  apiOpts?: ApiClientOpts        // 传给 createApiClient 当 client 没传时
  footerExtras?: React.ReactNode  // 自定义 footer 加内容 (例 buy me coffee link)
  topicBreakLabel?: string         // 默认 "开新话题"
}

export function ChatShell({
  title,
  subtitle,
  welcome,
  avatarFallback,
  avatarColor,
  client: externalClient,
  apiOpts,
  footerExtras,
  topicBreakLabel = "开新话题",
}: ChatShellProps) {
  const client = React.useMemo(
    () => externalClient ?? createApiClient(apiOpts),
    [externalClient, apiOpts],
  )
  const { messages, sending, error, onSend, onTopicBreak } = useChat({ welcome, client })
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleSend = React.useCallback(async (text: string) => {
    setMenuOpen(false)
    await onSend(text)
  }, [onSend])

  const handleTopicBreak = React.useCallback(async () => {
    setMenuOpen(false)
    await onTopicBreak()
  }, [onTopicBreak])

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <main className="flex-1 min-h-0 flex flex-col relative">
        <ChatPage
          title={title}
          subtitle={subtitle}
          online={!sending}
          messages={messages}
          inputDisabled={sending || !client.READY}
          onSend={handleSend}
          onBack={() => {}}
          onSettings={() => setMenuOpen((v) => !v)}
          avatarFallback={avatarFallback}
          avatarColor={avatarColor}
        />
        {menuOpen && (
          <div className="absolute right-3 top-14 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
            <button
              onClick={handleTopicBreak}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted"
            >
              {topicBreakLabel}
            </button>
          </div>
        )}
      </main>
      <footer className="shrink-0 px-3 py-1 text-[10px] text-muted-foreground bg-card border-t border-border flex justify-between items-center gap-2">
        <span className="truncate">uid: {client.userId().slice(0, 16)}…</span>
        {error && <span className="text-destructive truncate">⚠ {error.slice(0, 50)}</span>}
        {!client.READY && <span className="text-muted-foreground">backend 待部署</span>}
        {footerExtras}
      </footer>
    </div>
  )
}

export type { Message }
