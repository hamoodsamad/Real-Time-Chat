import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limitToLast,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { markMessagesAsRead } from "../services/chatService";

export const useMessages = (conversationId, currentUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages",
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"), limitToLast(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = [];
      const unreadIds = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgList.push({ id: docSnap.id, ...data });

        if (
          data.senderId !== currentUserId &&
          (!data.readBy || !data.readBy.includes(currentUserId))
        ) {
          unreadIds.push(docSnap.id);
        }
      });

      setMessages(msgList);
      setLoading(false);

      if (unreadIds.length > 0) {
        markMessagesAsRead(conversationId, currentUserId, unreadIds);
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId]);

  return { messages, loading };
};
