import React, { useState, useMemo } from "react";
import { Search, Smile, ThumbsUp, Heart, Sparkles, Coffee, Lightbulb, Compass, X } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥹", "😊",
      "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
      "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎",
      "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁",
      "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤", "😠",
      "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥",
      "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🫡", "🤫", "🫠", "🤥",
      "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲",
      "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮"
    ],
  },
  {
    id: "people",
    name: "People & Gestures",
    icon: ThumbsUp,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌",
      "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜",
      "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳",
      "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀",
      "🫁", "🦷", "🦴", "👀", "👁️", "👅", "👄", "🫦", "👶", "👧"
    ],
  },
  {
    id: "hearts",
    name: "Love & Hearts",
    icon: Heart,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
      "💟", "💌", "💋", "💐", "🌹", "🥀", "🌺", "🌸", "✨", "⭐",
      "🌟", "💫", "💥", "🔥", "💯", "🎉", "🎊", "🎈", "🎂", "🎁"
    ],
  },
  {
    id: "activities",
    name: "Activities",
    icon: Sparkles,
    emojis: [
      "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "⚽", "🏀", "🏈", "⚾",
      "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒",
      "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊",
      "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🎮", "🕹️", "🎲", "🎯"
    ],
  },
  {
    id: "food",
    name: "Food & Drinks",
    icon: Coffee,
    emojis: [
      "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷",
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🍕", "🍔",
      "🍟", "🌭", "🍿", "🧈", "🥞", "🧇", "🧀", "🍗", "🌮", "🌯"
    ],
  },
  {
    id: "objects",
    name: "Objects & Symbols",
    icon: Lightbulb,
    emojis: [
      "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "📷", "📸", "📹",
      "📼", "🔍", "🔎", "💡", "🔦", "📖", "📚", "🏷️", "💰", "💵",
      "💳", "💎", "⚖️", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓",
      "🔒", "🔓", "🔏", "🔐", "🔑", "🗝️", "⏰", "⏱️", "⏳", "⌛"
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: Compass,
    emojis: [
      "📍", "🗺️", "🧭", "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓",
      "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🛵", "🏍️", "🚲",
      "✈️", "🛫", "🛬", "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🚢",
      "🏝️", "🏖️", "🏕️", "⛺", "🏠", "🏡", "🏢", "🏬", "🕌", "🕋"
    ],
  },
];

export const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  const [activeTab, setActiveTab] = useState("smileys");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      const active = EMOJI_CATEGORIES.find((c) => c.id === activeTab);
      return active ? active.emojis : [];
    }
    const q = searchQuery.toLowerCase();
    const matches = [];
    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((em) => {
        if (em.includes(q)) matches.push(em);
      });
    });
    // Fallback: search by category name
    if (matches.length === 0) {
      const matchedCat = EMOJI_CATEGORIES.find((cat) =>
        cat.name.toLowerCase().includes(q),
      );
      if (matchedCat) return matchedCat.emojis;
    }
    return matches;
  }, [activeTab, searchQuery]);

  return (
    <div className="whatsapp-emoji-picker">
      <div className="emoji-picker-header">
        <div className="emoji-search-wrapper">
          <Search size={15} className="emoji-search-icon" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="emoji-search-clear"
              onClick={() => setSearchQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          className="emoji-picker-close-btn"
          onClick={onClose}
          title="Close emoji panel"
        >
          <X size={16} />
        </button>
      </div>

      {!searchQuery && (
        <div className="emoji-category-tabs">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`emoji-tab-btn ${isActive ? "active-tab" : ""}`}
                onClick={() => setActiveTab(cat.id)}
                title={cat.name}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      )}

      <div className="emoji-grid-region">
        {filteredEmojis.length === 0 ? (
          <div className="emoji-empty-state">No emojis found</div>
        ) : (
          filteredEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              type="button"
              className="single-emoji-btn"
              onClick={() => onSelectEmoji(emoji)}
            >
              {emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
