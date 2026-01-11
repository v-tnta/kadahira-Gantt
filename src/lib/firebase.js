// Firebaseの初期化設定ファイルです。
// まだAPIキーなどが設定されていないため、後ほど設定する必要があります。

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebaseコンソールから取得した設定をここに貼り付けます
const firebaseConfig = {
  apiKey: "AIzaSyCci5_RF_DQbYtn27zhlcJQLhh0WikT7wA",
  authDomain: "kadahira-gantt.firebaseapp.com",
  projectId: "kadahira-gantt",
  storageBucket: "kadahira-gantt.firebasestorage.app",
  messagingSenderId: "119338239476",
  appId: "1:119338239476:web:c0e24f34ecac09ae4525a1",
  measurementId: "G-L47J9LB87M"
};


// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreのインスタンスをエクスポートして、他のファイルで使えるようにします
export const db = getFirestore(app);
