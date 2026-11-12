import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig";

export const uploadAttachment = async (file, folderPath) => {
  const timestamp = Date.now();
  const cleanFileName = (file.name || "audio.webm").replace(
    /[^a-zA-Z0-9.]/g,
    "_",
  );
  const storageRef = ref(
    storage,
    `${folderPath}/${timestamp}_${cleanFileName}`,
  );

  const metadata = {
    contentType: file.type || "audio/webm",
  };

  const uploadResult = await uploadBytes(storageRef, file, metadata);
  const downloadUrl = await getDownloadURL(uploadResult.ref);

  return {
    downloadUrl,
    fileName: file.name || "Voice Message",
    fileSize: file.size,
    fileType: file.type || "audio/webm",
  };
};
