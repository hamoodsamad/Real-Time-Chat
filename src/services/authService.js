import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export const registerUser = async (email, password, displayName, username) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName });
  await sendEmailVerification(user);

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      displayName,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      photoURL: "",
      bio: "Available to chat",
      isOnline: true,
      lastSeen: serverTimestamp(),
      blockedUsers: [],
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      isOnline: true,
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const logoutUser = async () => {
  if (auth.currentUser) {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(
      userDocRef,
      {
        isOnline: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  }
  return signOut(auth);
};

export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};
