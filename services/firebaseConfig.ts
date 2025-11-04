import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD8qzhcIri89ZTlcHk0uaI5TFI4FBgJ_yI",
  authDomain: "hyuni-pay.firebaseapp.com",
  projectId: "hyuni-pay",
  storageBucket: "hyuni-pay.firebasestorage.app",
  messagingSenderId: "154345394371",
  appId: "1:154345394371:web:cd8e2f40dc802cb95d9276",
  measurementId: "G-R2WTRXZMV4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

export const uploadReceiptImage = async (file: File): Promise<string> => {
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
  const storageRef = ref(storage, `receipts/${uniqueFileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

export const deleteReceiptImage = async (imageUrl: string): Promise<void> => {
  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const pathStartIndex = decodedUrl.indexOf('o/') + 2;
    const pathEndIndex = decodedUrl.indexOf('?');
    const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);

    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
    console.log("Receipt image deleted successfully.");
  } catch (error) {
    console.error("Error deleting receipt image:", error);
  }
};
