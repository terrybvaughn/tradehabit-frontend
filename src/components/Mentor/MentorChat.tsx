import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./MentorChat.module.css";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { sendMessage } from "@/lib/mentor/api";
import { useAnalysisStatus } from "@/AnalysisStatusContext";
import { useSummary } from "@/api/hooks";
import { generateWelcomeMessage, formatWelcomeMessage } from "@/lib/mentor/welcomeMessage";

interface Message {
  role: "user" | "assistant" | "status" | "error";
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
  const { ready } = useAnalysisStatus();
  const { data: summaryData } = useSummary(ready);

  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    word: string;
    startTime: number;
    elapsed: number;
    isActive: boolean;
  } | null>(null);

  // Welcome message and priming state
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const [streamingWelcome, setStreamingWelcome] = useState(false);
  const [assistantPrimed, setAssistantPrimed] = useState(false);
  const [primingInProgress, setPrimingInProgress] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const primingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Streaming effect for welcome message
  const streamText = (text: string, onComplete: () => void) => {
    setStreamingWelcome(true);
    let currentText = '';
    let index = 0;

    const typeNextChar = () => {
      if (index < text.length) {
        currentText += text[index];
        setMessages([{ role: "assistant", text: currentText }]);
        index++;

        // Natural pauses with randomization (20ms ±5ms)
        let delay = 20 + (Math.random() * 10 - 5);
        if (text[index - 1] === '.') delay += 100;
        else if (text[index - 1] === ',') delay += 50;
        else if (text[index - 1] === '\n') delay += 150;

        streamingTimeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        setStreamingWelcome(false);
        onComplete();
      }
    };

    typeNextChar();
  };

  // Prime Assistant with "reset" message
  const primeAssistant = async () => {
    setPrimingInProgress(true);

    // Start 60-second timer for status message
    primingTimeoutRef.current = setTimeout(() => {
      if (!assistantPrimed) {
        setMessages(prev => [...prev, {
          role: "assistant",
          text: "Hang tight, Franklin is still loading your data..."
        }]);
      }
    }, 60000);

    try {
      const response = await sendMessage('reset', undefined);

      // Check for successful reset
      if (response.text.toLowerCase().includes('session has been reset')) {
        setThreadId(response.threadId);
        setAssistantPrimed(true);
        setPrimingInProgress(false);

        // Clear timeout if priming succeeded
        if (primingTimeoutRef.current) {
          clearTimeout(primingTimeoutRef.current);
          primingTimeoutRef.current = null;
        }
      } else {
        // Wrong response
        throw new Error('Unexpected response from Assistant');
      }
    } catch (error) {
      setPrimingInProgress(false);
      setAssistantPrimed(false);

      // Clear timeout
      if (primingTimeoutRef.current) {
        clearTimeout(primingTimeoutRef.current);
        primingTimeoutRef.current = null;
      }

      // Show error message
      setMessages(prev => [...prev, {
        role: "error",
        text: error instanceof Error && error.message === 'Unexpected response from Assistant'
          ? "Mentor received an unexpected response. Please try uploading your data again."
          : "Mentor is temporarily unavailable. Please try again later."
      }]);
    }
  };

  // Trigger welcome message and priming when ready
  useEffect(() => {
    if (ready && !welcomeMessageShown && summaryData !== undefined) {
      setWelcomeMessageShown(true);

      // Generate welcome message
      const welcomeData = generateWelcomeMessage(summaryData);
      const welcomeText = formatWelcomeMessage(welcomeData);

      // Start parallel processes: streaming + priming
      streamText(welcomeText, () => {
        // Welcome streaming complete
        console.log('Welcome message streaming complete');
      });

      primeAssistant();
    }
  }, [ready, summaryData, welcomeMessageShown]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (primingTimeoutRef.current) {
        clearTimeout(primingTimeoutRef.current);
      }
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

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
      <PromptInput
        onSend={handleSendMessage}
        loading={loading}
        disabled={!ready || streamingWelcome || primingInProgress || !assistantPrimed}
      />
    </div>
  );
};
