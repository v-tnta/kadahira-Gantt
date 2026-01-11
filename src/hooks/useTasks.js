import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * タスク管理のカスタムフック (Firestore版)
 * Firestoreとリアルタイム同期し、データの追加・更新・論理削除・監視を行います。
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
        // Note: isDeletedフィールドでのフィルタリングはクライアント側で行う（既存データ対応のため）
        const q = query(tasksCollection, orderBy('createdAt', 'desc'));

        // リアルタイム監視 (onSnapshot)
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // 取得したデータを配列に変換
            const newTasks = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    // FirestoreのTimestamp型をDate型に変換 (日付表示用)
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                    deadline: doc.data().deadline // 文字列のまま扱うか、必要なら変換
                }))
                // 論理削除（isDeleted: true）されていないものだけを表示
                .filter(task => !task.isDeleted);

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
                isDeleted: false, // 初期値
                createdAt: serverTimestamp() // サーバー側の日時を使用
            });
            console.log("タスク追加成功");
        } catch (err) {
            console.error("タスク追加エラー:", err);
            alert("タスクの追加に失敗しました");
        }
    };

    /**
     * タスクを更新する関数
     * @param {string} taskId
     * @param {Object} updates - 更新したいフィールド
     */
    const updateTask = async (taskId, updates) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, updates);
            console.log("タスク更新成功");
        } catch (err) {
            console.error("タスク更新エラー:", err);
            alert("タスクの更新に失敗しました");
        }
    };

    /**
     * タスクを論理削除（非表示）にする関数
     * @param {string} taskId
     */
    const deleteTask = async (taskId) => {
        if (!window.confirm("このタスクを目録から外しますか？（データは残ります）")) return;

        try {
            const taskRef = doc(db, 'tasks', taskId);
            // 物理削除 (deleteDoc) ではなく、フラグによる論理削除
            await updateDoc(taskRef, { isDeleted: true });
            console.log("タスク論理削除成功");
        } catch (err) {
            console.error("タスク削除エラー:", err);
            alert("タスクの削除に失敗しました");
        }
    };

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        loading,
        error
    };
};