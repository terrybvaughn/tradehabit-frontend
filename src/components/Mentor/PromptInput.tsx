import type { FC } from "react";
import { useState, useRef, useEffect } from "react";
import styles from "./MentorChat.module.css";
import arrowUpIcon from "@/assets/images/icon-arrow-up.svg";
import { trackEvent } from "@/utils/analytics";

interface PromptInputProps {
  onSend: (text: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const PromptInput: FC<PromptInputProps> = ({ onSend, loading = false, disabled = false }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set height based on scrollHeight (CSS max-height handles the 12-line cap)
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (!loading && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [loading, disabled]);

  const handleSend = () => {
    if (!input.trim() || loading || disabled) return;
    
    // Track mentor prompt event
    trackEvent('mentor_prompt');
    
    onSend(input);
    setInput("");
    // Reset height after clearing input
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.promptInputContainer}>
      <textarea
        ref={textareaRef}
        className={styles.promptInput}
        placeholder={disabled ? "Analytics processing..." : "Ask Franklin a question..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || disabled}
        rows={1}
      />
      <div className={styles.buttonRibbon}>
        <button
          className={`${styles.submitButton} ${input.trim() && !loading && !disabled ? styles.submitButtonActive : ""}`}
          type="button"
          disabled={!input.trim() || loading || disabled}
          onClick={handleSend}
        >
          <img src={arrowUpIcon} alt="Send" height={22} style={{ opacity: (loading || disabled) ? 0.3 : 1 }} />
        </button>
      </div>
    </div>
  );
};
