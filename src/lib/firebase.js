// Firebaseの初期化設定ファイルです。
// まだAPIキーなどが設定されていないため、後ほど設定する必要があります。

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebaseコンソールから取得した設定をここに貼り付けます
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreのインスタンスをエクスポートして、他のファイルで使えるようにします
export const db = getFirestore(app);
