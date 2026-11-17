import { useState, useRef, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const peerConnectionRef = useRef(null);

  const startMedia = useCallback(async (isVideo = true) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
        : false,
    });
    setLocalStream(stream);
    return stream;
  }, []);

  const bindRemoteTracks = useCallback((peerConnection) => {
    const remote = new MediaStream();
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      } else if (event.track) {
        remote.addTrack(event.track);
      }
    };
    setRemoteStream(remote);
    peerConnectionRef.current = peerConnection;
  }, []);

  const listenForIceCandidates = useCallback((callId, collectionName) => {
    if (!peerConnectionRef.current || !callId) return;

    const candidatesRef = collection(db, "calls", callId, collectionName);
    return onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const candidateData = change.doc.data();
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidateData),
            );
          } catch (e) {
            // drop malformed candidates safely
          }
        }
      });
    });
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  const cleanupMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  }, [localStream, remoteStream]);

  return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    startMedia,
    bindRemoteTracks,
    listenForIceCandidates,
    toggleAudio,
    toggleVideo,
    cleanupMedia,
    peerConnectionRef,
  };
};
