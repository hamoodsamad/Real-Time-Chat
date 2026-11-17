import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const searchUsers = async (searchTerm, currentUserId) => {
  if (!searchTerm.trim()) return [];

  const lower = searchTerm.toLowerCase().trim();
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("username", ">=", lower),
    where("username", "<=", lower + "\uf8ff"),
  );

  const snapshot = await getDocs(q);
  const results = [];

  snapshot.forEach((d) => {
    if (d.id !== currentUserId) {
      results.push({ id: d.id, ...d.data() });
    }
  });

  return results;
};

export const updateUserStatus = async (userId, isOnline) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  try {
    await setDoc(
      userRef,
      {
        isOnline,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (e) {
    // ignore disconnected network drops
  }
};

export const getUserById = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const updateUserProfile = async (userId, updates) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, updates, { merge: true });
};

export const archiveConversation = async (userId, conversationId) => {
  if (!userId || !conversationId) return;
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    archivedConversations: arrayUnion(conversationId),
  });
};

export const unarchiveConversation = async (userId, conversationId) => {
  if (!userId || !conversationId) return;
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    archivedConversations: arrayRemove(conversationId),
  });
};
