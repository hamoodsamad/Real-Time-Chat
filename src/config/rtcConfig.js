export const getIceServers = () => {
  const turnUrl = import.meta.env.VITE_TURN_SERVER_URL;
  const turnUser = import.meta.env.VITE_TURN_USERNAME;
  const turnPass = import.meta.env.VITE_TURN_CREDENTIAL;

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  if (turnUrl && turnUser && turnPass) {
    iceServers.push({
      urls: turnUrl,
      username: turnUser,
      credential: turnPass,
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};
