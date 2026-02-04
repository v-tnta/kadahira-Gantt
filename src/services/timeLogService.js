import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TimeLog } from '../domain/timeLog';

const COLLECTION_NAME = 'timeLogs';

/**
 * タイムログ一覧をリアルタイム監視する
 */
export const subscribeToTimeLogs = (onUpdate, onError) => {
    const logsCollection = collection(db, COLLECTION_NAME);
    const q = query(logsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map((doc) => {
            return TimeLog.fromFirestore(doc.id, doc.data());
        });
        onUpdate(logs);
    }, onError);
};

/**
 * タイムログを追加する
 */
export const addTimeLog = async (logData) => {
    const logsCollection = collection(db, COLLECTION_NAME);
    await addDoc(logsCollection, {
        ...logData, // Entityから変換、またはそのままオブジェクト
        createdAt: serverTimestamp()
    });
};
