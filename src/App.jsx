import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { CallContext } from "./context/CallContext";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatArea } from "./components/chat/ChatArea";
import { CallModal } from "./components/calls/CallModal";
import { VideoCallOverlay } from "./components/calls/VideoCallOverlay";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useConversations } from "./hooks/useConversations";
import { useWebRTC } from "./hooks/useWebRTC";
import {
  createCallOffer,
  answerCall,
  endCallSession,
} from "./services/callSignalingService";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./config/firebaseConfig";

export const App = () => {
  const { currentUser, userProfile } = useContext(AuthContext);
  const {
    incomingCall,
    dismissIncomingCall,
    activeCallSession,
    setActiveCallSession,
  } = useContext(CallContext);

  const [authView, setAuthView] = useState("login");
  const [activeConversation, setActiveConversation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { conversations } = useConversations(currentUser?.uid);

  const {
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
  } = useWebRTC();

  useEffect(() => {
    if (!activeCallSession?.callId) return;

    const callRef = doc(db, "calls", activeCallSession.callId);
    const unsubscribe = onSnapshot(callRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      if (data.status === "ended" || data.status === "rejected") {
        cleanupMedia();
        setActiveCallSession(null);
      }

      if (
        data.answer &&
        peerConnectionRef.current &&
        peerConnectionRef.current.signalingState === "have-local-offer"
      ) {
        peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
      }
    });

    return () => unsubscribe();
  }, [
    activeCallSession,
    cleanupMedia,
    peerConnectionRef,
    setActiveCallSession,
  ]);

  const handleStartOutgoingCall = async (targetUser, callType) => {
    try {
      const stream = await startMedia(callType === "video");
      const { peerConnection, callId } = await createCallOffer(
        currentUser,
        targetUser.id,
        callType,
        stream,
      );

      bindRemoteTracks(peerConnection);
      listenForIceCandidates(callId, "receiverCandidates");

      setActiveCallSession({
        callId,
        type: callType,
        role: "caller",
      });
    } catch (e) {
      cleanupMedia();
    }
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await startMedia(incomingCall.type === "video");
      const peerConnection = await answerCall(incomingCall.id, stream);

      bindRemoteTracks(peerConnection);
      listenForIceCandidates(incomingCall.id, "callerCandidates");

      setActiveCallSession({
        callId: incomingCall.id,
        type: incomingCall.type,
        role: "receiver",
      });
      dismissIncomingCall();
    } catch (e) {
      cleanupMedia();
    }
  };

  const handleHangup = async () => {
    if (activeCallSession?.callId) {
      await endCallSession(activeCallSession.callId);
    }
    cleanupMedia();
    setActiveCallSession(null);
  };

  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        {authView === "login" ? (
          <Login onSwitchToRegister={() => setAuthView("register")} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView("login")} />
        )}
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        currentUser={currentUser}
        userProfile={userProfile}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ChatArea
        conversation={activeConversation}
        currentUser={currentUser}
        userProfile={userProfile}
        onStartCall={handleStartOutgoingCall}
      />

      <CallModal
        incomingCall={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onReject={dismissIncomingCall}
      />

      {activeCallSession && (
        <VideoCallOverlay
          localStream={localStream}
          remoteStream={remoteStream}
          callType={activeCallSession.type}
          onEndCall={handleHangup}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
      />
    </div>
  );
};
