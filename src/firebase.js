import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD68qBdyMS9sjIFDpG1ATviHdxPcpZ_kF8",
  authDomain: "lojitak-2f0f4.firebaseapp.com",
  projectId: "lojitak-2f0f4",
  storageBucket: "lojitak-2f0f4.firebasestorage.app",
  messagingSenderId: "154040667814",
  appId: "1:154040667814:web:2625b9bc62d734bfe92e67",
  measurementId: "G-EHGTRDC276"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
