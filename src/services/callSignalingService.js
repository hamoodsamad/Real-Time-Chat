import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { getIceServers } from "../config/rtcConfig";

export const createCallOffer = async (
  caller,
  receiverId,
  callType,
  localStream,
) => {
  const callDocRef = doc(collection(db, "calls"));
  const callerCandidatesCollection = collection(callDocRef, "callerCandidates");
  const receiverCandidatesCollection = collection(
    callDocRef,
    "receiverCandidates",
  );

  const peerConnection = new RTCPeerConnection(getIceServers());

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(callerCandidatesCollection, event.candidate.toJSON());
    }
  };

  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  const callData = {
    callId: callDocRef.id,
    callerId: caller.uid,
    callerName: caller.displayName || "Anonymous",
    callerPhoto: caller.photoURL || "",
    receiverId,
    type: callType,
    status: "ringing",
    offer: {
      type: offerDescription.type,
      sdp: offerDescription.sdp,
    },
    createdAt: serverTimestamp(),
  };

  await setDoc(callDocRef, callData);

  return { peerConnection, callId: callDocRef.id };
};

export const answerCall = async (callId, localStream) => {
  const callDocRef = doc(db, "calls", callId);
  const callSnapshot = await getDoc(callDocRef);
  if (!callSnapshot.exists()) throw new Error("Call session expired");

  const callData = callSnapshot.data();
  const peerConnection = new RTCPeerConnection(getIceServers());

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  const receiverCandidatesCollection = collection(
    callDocRef,
    "receiverCandidates",
  );
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      addDoc(receiverCandidatesCollection, event.candidate.toJSON());
    }
  };

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(callData.offer),
  );

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);

  await updateDoc(callDocRef, {
    answer: {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    },
    status: "ongoing",
  });

  return peerConnection;
};

export const endCallSession = async (callId) => {
  if (!callId) return;
  const callDocRef = doc(db, "calls", callId);
  await updateDoc(callDocRef, {
    status: "ended",
    endedAt: serverTimestamp(),
  });
};
