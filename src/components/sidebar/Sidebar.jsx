import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Settings,
  LogOut,
  Search,
  Archive,
  ArrowLeft,
} from "lucide-react";
import { Avatar } from "../common/Avatar";
import { ConversationItem } from "./ConversationItem";
import { UserSearchModal } from "./UserSearchModal";
import {
  getUserById,
  archiveConversation,
  unarchiveConversation,
} from "../../services/userService";
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
  const [showArchivedView, setShowArchivedView] = useState(false);

  const archivedIds = useMemo(
    () => userProfile?.archivedConversations || [],
    [userProfile?.archivedConversations],
  );

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

  const handleToggleArchive = async (convId, isCurrentlyArchived) => {
    if (isCurrentlyArchived) {
      await unarchiveConversation(currentUser.uid, convId);
    } else {
      await archiveConversation(currentUser.uid, convId);
    }
  };

  // Partition into Active and Archived
  const { activeList, archivedList } = useMemo(() => {
    const active = [];
    const archived = [];

    enrichedConversations.forEach((c) => {
      if (archivedIds.includes(c.id)) {
        archived.push(c);
      } else {
        active.push(c);
      }
    });

    return { activeList: active, archivedList: archived };
  }, [enrichedConversations, archivedIds]);

  const currentDisplayList = showArchivedView ? archivedList : activeList;

  const filtered = currentDisplayList.filter((c) => {
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
            title="Profile & Settings"
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
          placeholder={
            showArchivedView
              ? "Filter archived..."
              : "Filter conversations..."
          }
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
      </div>

      {/* WhatsApp-Style Archived Chats Banner or Header */}
      {showArchivedView ? (
        <div className="sidebar-archived-nav-header">
          <button
            type="button"
            className="archived-back-btn"
            onClick={() => setShowArchivedView(false)}
            title="Back to all chats"
          >
            <ArrowLeft size={18} />
          </button>
          <h4>Archived Chats ({archivedList.length})</h4>
        </div>
      ) : (
        archivedList.length > 0 && (
          <div
            className="sidebar-archived-banner"
            onClick={() => setShowArchivedView(true)}
            title="View archived chats"
          >
            <div className="archived-banner-left">
              <Archive size={17} />
              <span>Archived</span>
            </div>
            <span className="archived-banner-count">
              {archivedList.length}
            </span>
          </div>
        )
      )}

      <div className="conversations-scroll-region">
        {filtered.length === 0 ? (
          <div className="sidebar-empty">
            <p>
              {showArchivedView
                ? "No archived conversations."
                : "No active conversations."}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={currentUser.uid}
              isSelected={activeConversation?.id === conv.id}
              onSelect={onSelectConversation}
              isArchived={archivedIds.includes(conv.id)}
              onToggleArchive={handleToggleArchive}
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
