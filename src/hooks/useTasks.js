import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * タスク管理のカスタムフック (Firestore版)
 * Firestoreとリアルタイム同期し、データの追加・監視を行います。
 */
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true); // 読み込み中フラグ
    const [error, setError] = useState(null);     // エラー情報

    // Firestoreの tasks コレクションを参照
    const tasksCollection = collection(db, 'tasks');

    // データの監視を開始 (マウント時に一度だけ実行)
    useEffect(() => {
        // クエリ作成: 作成日時の新しい順に並べる
        const q = query(tasksCollection, orderBy('createdAt', 'desc'));

        // リアルタイム監視 (onSnapshot)
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // 取得したデータを配列に変換
            const newTasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                // FirestoreのTimestamp型をDate型に変換 (日付表示用)
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                deadline: doc.data().deadline // 文字列のまま扱うか、必要なら変換
            }));

            setTasks(newTasks);
            setLoading(false);
        }, (err) => {
            console.error("Firestore Error:", err);
            setError(err);
            setLoading(false);
        });

        // アンマウント時に監視を解除
        return () => unsubscribe();
    }, []);

    /**
     * 新しいタスクをFirestoreに追加する関数
     */
    const addTask = async (task) => {
        try {
            await addDoc(tasksCollection, {
                ...task,
                status: 'TODO',
                createdAt: serverTimestamp() // サーバー側の日時を使用
            });
            console.log("タスク追加成功");
        } catch (err) {
            console.error("タスク追加エラー:", err);
            alert("タスクの追加に失敗しました");
        }
    };

    return {
        tasks,
        addTask,
        loading,
        error
    };
};