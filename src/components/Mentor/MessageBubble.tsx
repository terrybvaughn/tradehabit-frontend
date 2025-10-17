import type { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MentorChat.module.css";

interface MessageBubbleProps {
  role: "user" | "assistant" | "status";
  content: string;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ role, content }) => {
  if (role === "user") {
    return (
      <div className={styles.userMessage}>
        {content}
      </div>
    );
  }

  if (role === "status") {
    return (
      <div className={`${styles.statusMessage} ${styles.statusMessageComplete}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={styles.assistantMessage}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
