import { useRef, useCallback } from "react";
import { setTypingStatus } from "../services/chatService";

export const useTyping = (conversationId, userId) => {
  const typingTimeoutRef = useRef(null);

  const triggerTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    if (!typingTimeoutRef.current) {
      setTypingStatus(conversationId, userId, true);
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(conversationId, userId, false);
      typingTimeoutRef.current = null;
    }, 2500);
  }, [conversationId, userId]);

  const cancelTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (conversationId && userId) {
      setTypingStatus(conversationId, userId, false);
    }
  }, [conversationId, userId]);

  return { triggerTyping, cancelTyping };
};
