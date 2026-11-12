import { useState, useRef, useCallback } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      // microhpone access denied
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, {
          type: "audio/webm",
        });

        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }

        clearInterval(timerIntervalRef.current);
        setIsRecording(false);
        setRecordingDuration(0);
        resolve(audioFile);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerIntervalRef.current);
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
