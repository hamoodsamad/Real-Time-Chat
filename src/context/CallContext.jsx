import React, { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCallSession, setActiveCallSession] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const callsRef = collection(db, "calls");
    const q = query(
      callsRef,
      where("receiverId", "==", currentUser.uid),
      where("status", "==", "ringing"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        setIncomingCall({ id: snapshot.docs[0].id, ...docData });
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const dismissIncomingCall = async () => {
    if (incomingCall) {
      const callRef = doc(db, "calls", incomingCall.id);
      await updateDoc(callRef, { status: "rejected" });
      setIncomingCall(null);
    }
  };

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        setIncomingCall,
        activeCallSession,
        setActiveCallSession,
        dismissIncomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
