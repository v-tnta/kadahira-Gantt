// Firebaseの初期化設定ファイルです。
// まだAPIキーなどが設定されていないため、後ほど設定する必要があります。

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebaseコンソールから取得した設定をここに貼り付けます
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreのインスタンスをエクスポートして、他のファイルで使えるようにします
export const db = getFirestore(app);
