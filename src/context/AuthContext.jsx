import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);

      try {
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          const generatedUsername = (
            user.email ? user.email.split("@")[0] : "user"
          ).toLowerCase();
          await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName || generatedUsername,
            username: generatedUsername,
            email: user.email || "",
            photoURL: user.photoURL || "",
            bio: "Available to chat",
            isOnline: true,
            lastSeen: serverTimestamp(),
            blockedUsers: [],
            createdAt: serverTimestamp(),
          });
        } else {
          await setDoc(
            userDocRef,
            { isOnline: true, lastSeen: serverTimestamp() },
            { merge: true },
          );
        }
      } catch (err) {
        // quiet fallback for restricted rules
      }

      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    });

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
