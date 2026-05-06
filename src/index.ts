// @akong/chat-shell · public API
//
// 抽自 mail-dayou-chat v0.1 (老板 5-7 拍 · 抽给所有阿空 chat 仓复用)

export { ChatShell } from "./ChatShell"
export type { ChatShellProps } from "./ChatShell"

export { useChat } from "./useChat"
export type { UseChatOpts, UseChatResult } from "./useChat"

export { createApiClient } from "./api"
export type {
  ApiClient,
  ApiClientOpts,
  BackendMessage,
  ChatResp,
} from "./api"
