import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * タイムログ（実績時間）を管理するカスタムフック
 */
export const useTimeLogs = () => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const timeLogsCollection = collection(db, 'timeLogs');

    // ログ履歴を監視（DashboardやGanttChart用）
    useEffect(() => {
        const q = query(timeLogsCollection, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startTime: doc.data().startTime?.toDate(),
                endTime: doc.data().endTime?.toDate(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setTimeLogs(logs);
        }, (err) => {
            console.error("TimeLogs Error:", err);
            // setError(err); // 初期ロード時の権限エラー等はここでキャッチ
        });

        return () => unsubscribe();
    }, []);

    /**
     * 作業完了時にログを保存する関数
     * @param {Object} log - { taskId, subTaskName, startTime, endTime, durationSeconds }
     */
    const addTimeLog = async (log) => {
        setLoading(true);
        try {
            await addDoc(timeLogsCollection, {
                ...log,
                createdAt: serverTimestamp()
            });
            console.log("TimeLog added successfully");
        } catch (err) {
            console.error("Failed to add TimeLog:", err);
            setError(err);
            alert("ログの保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return {
        timeLogs,
        addTimeLog,
        loading,
        error
    };
};
