import React, { useState, useRef } from "react";
import { Check, CheckCheck, Play, Pause, Mic } from "lucide-react";
import { updateMessageReaction } from "../../services/chatService";

export const MessageItem = ({ message, currentUserId, conversationId }) => {
  const isMine = message.senderId === currentUserId;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef(null);

  const handleQuickReaction = (emoji) => {
    updateMessageReaction(conversationId, message.id, emoji, currentUserId);
  };

  const handleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatMessageTime = (ts) => {
    if (!ts) return "";
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`message-row ${isMine ? "message-outgoing" : "message-incoming"}`}
    >
      <div className="message-container">
        {!isMine && (
          <span className="message-author">{message.senderName}</span>
        )}

        {message.type === "audio" && message.mediaUrl && (
          <div className="voice-message-player">
            <audio
              ref={audioPlayerRef}
              src={message.mediaUrl}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
            <button
              type="button"
              className="voice-play-toggle-btn"
              onClick={handleAudioPlayback}
            >
              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="play-icon-offset" />
              )}
            </button>
            <div className="voice-waveform-simulation">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
            <Mic size={14} className="voice-note-type-icon" />
          </div>
        )}

        {message.type === "image" && message.mediaUrl && (
          <div className="message-image-wrapper">
            <img
              src={message.mediaUrl}
              alt="attachment"
              className="chat-media-attachment"
            />
          </div>
        )}

        {message.type === "file" && message.mediaUrl && (
          <div className="message-file-wrapper">
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="file-attachment-link"
            >
              <span>{message.fileName || "Download Document"}</span>
            </a>
          </div>
        )}

        {message.type !== "audio" && message.text && (
          <p className="message-text">{message.text}</p>
        )}

        <div className="message-meta-footer">
          <span className="message-time">
            {formatMessageTime(message.timestamp)}
          </span>
          {isMine && (
            <span className="message-checkmarks">
              {message.status === "read" ? (
                <CheckCheck size={14} className="check-read" />
              ) : (
                <Check size={14} className="check-sent" />
              )}
            </span>
          )}
        </div>

        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="reactions-display-bar">
            {Object.entries(message.reactions).map(([emoji, uids]) => (
              <span
                key={emoji}
                className={`reaction-pill ${uids.includes(currentUserId) ? "reaction-active" : ""}`}
                onClick={() => handleQuickReaction(emoji)}
              >
                {emoji} {uids.length}
              </span>
            ))}
          </div>
        )}

        <div className="message-reaction-picker">
          <button
            className="reaction-trigger-btn"
            onClick={() => handleQuickReaction("👍")}
          >
            👍
          </button>
          <button
            className="reaction-trigger-btn"
            onClick={() => handleQuickReaction("❤️")}
          >
            ❤️
          </button>
          <button
            className="reaction-trigger-btn"
            onClick={() => handleQuickReaction("😂")}
          >
            😂
          </button>
        </div>
      </div>
    </div>
  );
};
