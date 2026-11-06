export type ChatMode = "demo" | "ai" | "safety";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Only set for assistant messages. */
  mode?: ChatMode;
}

export interface ChatApiResponse {
  answer: string;
  mode: ChatMode;
  safety_notice: string;
}

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}
