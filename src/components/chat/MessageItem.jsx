import React, { useState, useRef } from "react";
import {
  Check,
  CheckCheck,
  Play,
  Pause,
  Mic,
  MapPin,
  ExternalLink,
  Trash2,
  Copy,
  Check as CopiedIcon,
} from "lucide-react";
import { updateMessageReaction, deleteMessage } from "../../services/chatService";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export const MessageItem = ({ message, currentUserId, conversationId }) => {
  const isMine = message.senderId === currentUserId;
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleCopyText = () => {
    const textToCopy = message.text || message.mapUrl || message.mediaUrl || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this message for everyone?")) {
      deleteMessage(conversationId, message.id);
    }
  };

  const formatMessageTime = (ts) => {
    if (!ts) return "";
    try {
      const date = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`message-row ${isMine ? "message-outgoing" : "message-incoming"}`}
    >
      <div className="message-container">
        {!isMine && (
          <span className="message-author">{message.senderName}</span>
        )}

        {/* Audio / Voice Note */}
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

        {/* Image with Optional Caption */}
        {message.type === "image" && message.mediaUrl && (
          <div className="message-image-card">
            <img
              src={message.mediaUrl}
              alt="attachment"
              className="chat-media-attachment"
            />
            {message.text && (
              <p className="message-image-caption">{message.text}</p>
            )}
          </div>
        )}

        {/* Location Card */}
        {message.type === "location" && (
          <div className="message-location-card">
            <div className="location-card-header">
              <div className="location-icon-badge">
                <MapPin size={20} />
              </div>
              <div className="location-info">
                <strong>Live Location</strong>
                <span>
                  {message.latitude && message.longitude
                    ? `${message.latitude.toFixed(4)}, ${message.longitude.toFixed(4)}`
                    : "Shared GPS Location"}
                </span>
              </div>
            </div>
            <a
              href={
                message.mapUrl ||
                `https://www.google.com/maps?q=${message.latitude},${message.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="location-view-btn"
            >
              <span>View in Google Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Document / File */}
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

        {/* Standard Text Message */}
        {message.type !== "audio" &&
          message.type !== "image" &&
          message.type !== "location" &&
          message.text && <p className="message-text">{message.text}</p>}

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

        {/* Active Emoji Reactions */}
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

        {/* WhatsApp-Style Hover Quick Actions & Reactions Bar */}
        <div className="message-hover-actions">
          <div className="message-reaction-picker">
            {QUICK_REACTIONS.map((em) => (
              <button
                key={em}
                type="button"
                className="reaction-trigger-btn"
                onClick={() => handleQuickReaction(em)}
              >
                {em}
              </button>
            ))}
          </div>

          <div className="message-extra-tools">
            <button
              type="button"
              className="message-tool-btn"
              onClick={handleCopyText}
              title="Copy message"
            >
              {copied ? <CopiedIcon size={14} /> : <Copy size={14} />}
            </button>
            {isMine && (
              <button
                type="button"
                className="message-tool-btn delete-btn"
                onClick={handleDelete}
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
