import React, { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

export const MessageList = ({
  messages,
  currentUserId,
  conversationId,
  loading,
}) => {
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="stream-loading">
        <div className="loading-spinner" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="stream-empty">
        <p>No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <section className="messages-stream">
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          conversationId={conversationId}
        />
      ))}
      <div ref={bottomScrollRef} />
    </section>
  );
};
