import React, { useRef, useEffect } from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { useMessages } from "../../hooks/useMessages";

export const ChatArea = ({
  conversation,
  currentUser,
  userProfile,
  onStartCall,
}) => {
  const { messages, loading } = useMessages(conversation?.id, currentUser?.uid);
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    bottomScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <main className="chat-empty-viewport">
        <div className="empty-viewport-content">
          <h3>Select a conversation</h3>
          <p>
            End-to-end encrypted messaging with WebRTC audio and video support.
          </p>
        </div>
      </main>
    );
  }

  const isDirect = conversation.type === "direct";
  const targetUser = conversation.otherUserData;
  const conversationTitle = isDirect
    ? targetUser?.displayName || targetUser?.username || "User"
    : conversation.groupMeta?.name;

  return (
    <main className="chat-viewport">
      <header className="chat-header">
        <div className="chat-header-profile">
          <Avatar
            src={
              isDirect ? targetUser?.photoURL : conversation.groupMeta?.photoURL
            }
            name={conversationTitle}
            isOnline={isDirect ? targetUser?.isOnline : null}
            size="medium"
          />
          <div className="header-meta">
            <h4>{conversationTitle}</h4>
            <span className="online-indicator-text">
              {isDirect
                ? targetUser?.isOnline
                  ? "Online"
                  : "Offline"
                : `${conversation.participants?.length} members`}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          {isDirect && (
            <>
              <button
                className="action-icon-button"
                title="Audio Call"
                onClick={() => onStartCall(targetUser, "audio")}
              >
                <Phone size={19} />
              </button>
              <button
                className="action-icon-button"
                title="Video Call"
                onClick={() => onStartCall(targetUser, "video")}
              >
                <Video size={19} />
              </button>
            </>
          )}
        </div>
      </header>

      <section className="messages-stream">
        {loading ? (
          <div className="stream-loading">Decrypting communications...</div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUserId={currentUser.uid}
              conversationId={conversation.id}
            />
          ))
        )}
        <div ref={bottomScrollRef} />
      </section>

      <MessageInput
        conversationId={conversation.id}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    </main>
  );
};
