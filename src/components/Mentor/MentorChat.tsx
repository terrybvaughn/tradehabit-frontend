import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./MentorChat.module.css";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { sendMessage } from "@/lib/mentor/api";
interface Message {
  role: "user" | "assistant" | "status";
  text: string;
  elapsed?: number;
}

const STATUS_WORDS = [
  "Pondering", "Ruminating", "Noodling", "Cogitating", "Scrutinizing",
  "Considering", "Thinking", "Contemplating", "Analyzing", "Tinkering",
  "Percolating", "Deliberating", "Reasoning"
];


const getRandomStatusWord = () => STATUS_WORDS[Math.floor(Math.random() * STATUS_WORDS.length)];

export const MentorChat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    word: string;
    startTime: number;
    elapsed: number;
    isActive: boolean;
  } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Prefer scrolling a sentinel into view for smoother behavior
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      return;
    }
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, statusMessage]);

  // Timer effect for status message
  useEffect(() => {
    if (statusMessage?.isActive) {
      statusIntervalRef.current = setInterval(() => {
        setStatusMessage(prev => prev ? {
          ...prev,
          elapsed: Math.floor((Date.now() - prev.startTime) / 1000)
        } : null);
      }, 1000);
    } else {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [statusMessage?.isActive]);

  const handleSendMessage = async (text: string) => {
    console.log("handleSendMessage called with:", text);
    if (!text.trim()) return;

    // Add user message immediately
    const userMessage: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    
    // Start status message
    const statusWord = getRandomStatusWord();
    const startTime = Date.now();
    console.log("Setting status message with word:", statusWord);
    setStatusMessage({
      word: statusWord,
      startTime: startTime,
      elapsed: 0,
      isActive: true
    });
    
    setLoading(true);

    try {
      console.log("Starting API call");
      const response = await sendMessage(text.trim(), threadId);
      console.log("API call completed, response:", response);

      // Calculate elapsed time and add status message
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const statusMsg: Message = {
        role: "status",
        text: `Thought for ${elapsed} seconds`,
        elapsed: elapsed
      };
      console.log("Adding status message:", statusMsg);
      setMessages((prev) => {
        const newMessages = [...prev, statusMsg];
        console.log("Updated messages:", newMessages);
        return newMessages;
      });

      if (response.error) {
        // Add error message as assistant response
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: `Error: ${response.error}` },
        ]);
      } else {
        // Update thread ID and add assistant response
        setThreadId(response.threadId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: response.text },
        ]);
      }
    } catch (error) {
      // Handle fetch errors
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${error instanceof Error ? error.message : "Failed to send message"}` },
      ]);
    } finally {
      // Stop status message
      setStatusMessage(null);
      setLoading(false);
    }
  };

  const renderStatusMessage = () => {
    if (!statusMessage) return null;
    
    const { word, elapsed, isActive } = statusMessage;
    const dots = isActive ? ".".repeat(elapsed % 4) : "";
    const text = isActive ? `${word}${dots}` : `Thought for ${elapsed} seconds`;
    
    return (
      <div className={`${styles.statusMessage} ${isActive ? styles.statusMessageActive : styles.statusMessageComplete}`}>
        {text}
      </div>
    );
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.messageList} ref={listRef}>
        {messages.length === 0 && !statusMessage ? (
          <div style={{ color: "#9EADB8", fontSize: "13px", padding: "12px 0" }}>
            {/* TODO: Add dummy content here */}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                <MessageBubble
                  role={message.role}
                  content={message.text}
                />
              </div>
            ))}
            {statusMessage?.isActive && renderStatusMessage()}
          </>
        )}
        <div ref={endRef} />
      </div>
      <PromptInput onSend={handleSendMessage} loading={loading} />
    </div>
  );
};
