export interface Message {
  role: "user" | "assistant";
  text: string;
}

export interface Thread {
  id: string;
  messages: Message[];
}

export interface ChatResponse {
  threadId: string;
  text: string;
  error?: string;
}
