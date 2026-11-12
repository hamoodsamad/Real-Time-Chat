import React, { useState, useEffect } from "react";
import { UserPlus, Settings, LogOut, Search } from "lucide-react";
import { Avatar } from "../common/Avatar";
import { ConversationItem } from "./ConversationItem";
import { UserSearchModal } from "./UserSearchModal";
import { getUserById } from "../../services/userService";
import { logoutUser } from "../../services/authService";

export const Sidebar = ({
  currentUser,
  userProfile,
  conversations,
  activeConversation,
  onSelectConversation,
  onOpenSettings,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [enrichedConversations, setEnrichedConversations] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const enrich = async () => {
      const updated = await Promise.all(
        conversations.map(async (conv) => {
          if (conv.type === "direct") {
            const otherId = conv.participants.find(
              (p) => p !== currentUser.uid,
            );
            const otherUserData = await getUserById(otherId);
            return { ...conv, otherUserData };
          }
          return conv;
        }),
      );
      if (isMounted) setEnrichedConversations(updated);
    };

    enrich();
    return () => {
      isMounted = false;
    };
  }, [conversations, currentUser.uid]);

  const filtered = enrichedConversations.filter((c) => {
    if (c.type === "direct") {
      const name =
        c.otherUserData?.displayName || c.otherUserData?.username || "";
      return name.toLowerCase().includes(filterQuery.toLowerCase());
    }
    return (c.groupMeta?.name || "")
      .toLowerCase()
      .includes(filterQuery.toLowerCase());
  });

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <div className="profile-summary">
          <Avatar
            src={userProfile?.photoURL}
            name={userProfile?.displayName}
            isOnline={true}
            size="medium"
          />
          <div className="profile-identifiers">
            <span className="profile-displayname">
              {userProfile?.displayName || "User"}
            </span>
            <span className="profile-username">
              @{userProfile?.username || "user"}
            </span>
          </div>
        </div>
        <div className="sidebar-actions">
          <button
            className="action-icon-button"
            title="Start Chat"
            onClick={() => setIsSearchOpen(true)}
          >
            <UserPlus size={19} />
          </button>
          <button
            className="action-icon-button"
            title="Account Settings"
            onClick={onOpenSettings}
          >
            <Settings size={19} />
          </button>
          <button
            className="action-icon-button"
            title="Sign Out"
            onClick={logoutUser}
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>

      <div className="sidebar-search-box">
        <Search size={16} className="search-box-icon" />
        <input
          type="text"
          placeholder="Filter conversations..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      <div className="conversations-scroll-region">
        {filtered.length === 0 ? (
          <div className="sidebar-empty">
            <p>No active conversations.</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={currentUser.uid}
              isSelected={activeConversation?.id === conv.id}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>

      <UserSearchModal
        currentUserId={currentUser.uid}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectConversation={onSelectConversation}
      />
    </aside>
  );
};
