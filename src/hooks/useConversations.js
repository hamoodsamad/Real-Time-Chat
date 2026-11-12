import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const useConversations = (userId) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convRef = collection(db, "conversations");
    const q = query(convRef, where("participants", "array-contains", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convList = [];
        snapshot.forEach((doc) => {
          convList.push({ id: doc.id, ...doc.data() });
        });

        // sort client-side to bypass composite index constraints
        convList.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return timeB - timeA;
        });

        setConversations(convList);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  return { conversations, loading };
};
