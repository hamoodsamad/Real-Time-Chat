import React from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { Avatar } from "../common/Avatar";

export const ConversationItem = ({
  conversation,
  currentUserId,
  isSelected,
  onSelect,
  isArchived = false,
  onToggleArchive,
}) => {
  const isDirect = conversation.type === "direct";
  const otherUserId = isDirect
    ? conversation.participants.find((id) => id !== currentUserId)
    : null;
  const isTyping =
    isDirect && otherUserId ? conversation.typing?.[otherUserId] : false;

  const title = isDirect
    ? conversation.otherUserData?.displayName ||
      conversation.otherUserData?.username ||
      "User"
    : conversation.groupMeta?.name || "Group Chat";

  const photo = isDirect
    ? conversation.otherUserData?.photoURL
    : conversation.groupMeta?.photoURL;

  const isOnline = isDirect ? conversation.otherUserData?.isOnline : null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date =
        typeof timestamp.toDate === "function"
          ? timestamp.toDate()
          : new Date(timestamp);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    if (onToggleArchive) {
      onToggleArchive(conversation.id, isArchived);
    }
  };

  return (
    <div
      className={`conversation-item ${isSelected ? "active-item" : ""}`}
      onClick={() => onSelect(conversation)}
    >
      <Avatar src={photo} name={title} isOnline={isOnline} size="medium" />
      <div className="conversation-details">
        <div className="conversation-header">
          <span className="conversation-title">{title}</span>
          <span className="conversation-timestamp">
            {formatTimestamp(
              conversation.lastMessage?.timestamp || conversation.updatedAt,
            )}
          </span>
        </div>
        <div className="conversation-preview-row">
          <p className="conversation-last-message">
            {isTyping ? (
              <span className="typing-status-text">typing...</span>
            ) : (
              conversation.lastMessage?.text || "No messages yet"
            )}
          </p>

          {onToggleArchive && (
            <button
              type="button"
              className="archive-action-btn"
              onClick={handleArchiveClick}
              title={isArchived ? "Unarchive chat" : "Archive chat"}
            >
              {isArchived ? (
                <ArchiveRestore size={16} />
              ) : (
                <Archive size={16} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
