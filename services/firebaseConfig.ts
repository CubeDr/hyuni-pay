import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export { db };
