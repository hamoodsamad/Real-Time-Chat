import React, { useState } from "react";
import { Search, X, MessageSquare } from "lucide-react";
import { searchUsers } from "../../services/userService";
import { getOrCreateDirectConversation } from "../../services/chatService";
import { Avatar } from "../common/Avatar";

export const UserSearchModal = ({
  currentUserId,
  isOpen,
  onClose,
  onSelectConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    const users = await searchUsers(searchTerm, currentUserId);
    setResults(users);
    setSearching(false);
  };

  const handleSelectUser = async (targetUser) => {
    const conv = await getOrCreateDirectConversation(currentUserId, targetUser);
    if (conv) {
      onSelectConversation({ ...conv, otherUserData: targetUser });
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Find People</h3>
          <button className="icon-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} className="modal-search-form">
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={searching}>
            <Search size={18} />
          </button>
        </form>

        <div className="modal-results-list">
          {searching && <p className="status-label">Searching directory...</p>}
          {!searching && results.length === 0 && searchTerm && (
            <p className="status-label">
              No accounts found matching "{searchTerm}"
            </p>
          )}
          {results.map((u) => (
            <div key={u.id} className="user-search-row">
              <Avatar
                src={u.photoURL}
                name={u.displayName}
                isOnline={u.isOnline}
                size="small"
              />
              <div className="user-search-info">
                <strong>{u.displayName}</strong>
                <span>@{u.username}</span>
              </div>
              <button
                type="button"
                className="action-button-sm"
                onClick={() => handleSelectUser(u)}
              >
                <MessageSquare size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
