import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  setDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const getOrCreateDirectConversation = async (
  currentUserOrId,
  targetUser,
) => {
  const currentUid =
    typeof currentUserOrId === "string"
      ? currentUserOrId
      : currentUserOrId?.uid;
  const targetUid = targetUser?.id || targetUser?.uid;

  if (!currentUid || !targetUid) return null;

  const convRef = collection(db, "conversations");
  const q = query(
    convRef,
    where("type", "==", "direct"),
    where("participants", "array-contains", currentUid),
  );

  const querySnapshot = await getDocs(q);
  let existingConv = null;

  querySnapshot.forEach((d) => {
    const data = d.data();
    if (data.participants && data.participants.includes(targetUid)) {
      existingConv = { id: d.id, ...data };
    }
  });

  if (existingConv) return existingConv;

  const newDocRef = doc(convRef);
  const conversationData = {
    id: newDocRef.id,
    type: "direct",
    participants: [currentUid, targetUid],
    participantData: {
      [currentUid]: { read: true },
      [targetUid]: { read: false },
    },
    typing: {
      [currentUid]: false,
      [targetUid]: false,
    },
    lastMessage: null,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  await setDoc(newDocRef, conversationData);
  return { id: newDocRef.id, ...conversationData };
};

export const sendMessage = async (
  conversationId,
  senderId,
  senderName,
  content,
) => {
  if (!conversationId || !senderId) return null;

  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages",
  );
  const messageData = {
    senderId,
    senderName: senderName || "User",
    text: content.text || "",
    type: content.type || "text",
    mediaUrl: content.mediaUrl || null,
    fileName: content.fileName || null,
    fileSize: content.fileSize || null,
    timestamp: serverTimestamp(),
    status: "sent",
    readBy: [senderId],
    reactions: {},
    replyTo: content.replyTo || null,
    isEdited: false,
    isDeleted: false,
  };

  const docRef = await addDoc(messagesRef, messageData);

  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    lastMessage: {
      text:
        content.text ||
        (content.type === "image"
          ? "Sent an image"
          : content.type === "audio"
            ? "Voice message"
            : "Sent an attachment"),
      senderId,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const setTypingStatus = async (conversationId, userId, isTyping) => {
  if (!conversationId || !userId) return;
  const convRef = doc(db, "conversations", conversationId);
  await updateDoc(convRef, {
    [`typing.${userId}`]: isTyping,
  });
};

export const markMessagesAsRead = async (
  conversationId,
  userId,
  unreadMessageIds,
) => {
  if (!conversationId || !userId || !unreadMessageIds?.length) return;

  await Promise.all(
    unreadMessageIds.map((msgId) => {
      const msgRef = doc(db, "conversations", conversationId, "messages", msgId);
      return updateDoc(msgRef, {
        readBy: arrayUnion(userId),
        status: "read",
      }).catch(() => {});
    }),
  );
};

export const updateMessageReaction = async (
  conversationId,
  messageId,
  emoji,
  userId,
) => {
  if (!conversationId || !messageId || !userId) return;
  const msgRef = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId,
  );
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const reactions = data.reactions || {};
  let usersList = reactions[emoji] || [];

  if (usersList.includes(userId)) {
    usersList = usersList.filter((id) => id !== userId);
    if (usersList.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = usersList;
    }
  } else {
    reactions[emoji] = [...usersList, userId];
  }

  await updateDoc(msgRef, { reactions });
};
