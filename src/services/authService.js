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

// Normalize phone number to internal auth email
const phoneToAuthEmail = (phoneNumber) => {
  const digits = phoneNumber.replace(/[^0-9]/g, "");
  return `phone_${digits}@streamline.app`;
};

export const registerUser = async (
  email,
  password,
  displayName,
  username,
  phoneNumber = "",
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName });
  try {
    await sendEmailVerification(user);
  } catch (e) {
    // optional email verification notification
  }

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      displayName,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      photoURL: "",
      bio: "Available to chat (StreamLine)",
      statusPreset: "Available",
      isOnline: true,
      lastSeen: serverTimestamp(),
      blockedUsers: [],
      archivedConversations: [],
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const registerWithPhone = async (
  phoneNumber,
  password,
  displayName,
  username,
) => {
  const virtualEmail = phoneToAuthEmail(phoneNumber);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    virtualEmail,
    password,
  );
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(
    userDocRef,
    {
      uid: user.uid,
      displayName,
      username: username.toLowerCase().trim(),
      email: virtualEmail,
      phoneNumber: phoneNumber.trim(),
      photoURL: "",
      bio: "Hey there! I am using StreamLine",
      statusPreset: "Available",
      isOnline: true,
      lastSeen: serverTimestamp(),
      blockedUsers: [],
      archivedConversations: [],
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const loginWithPhone = async (phoneNumber, password) => {
  const virtualEmail = phoneToAuthEmail(phoneNumber);
  return loginUser(virtualEmail, password);
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

export const resendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
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
