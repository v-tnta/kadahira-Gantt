import { useState, useEffect } from 'react';
import * as timeLogService from '../services__Infrastructure/timeLogService';

/**
 * タイムログ（実績時間）を管理するカスタムフック
 */
export const useTimeLogs = () => {
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ログ履歴を監視
    useEffect(() => {
        const unsubscribe = timeLogService.subscribeToTimeLogs(
            (logs) => {
                setTimeLogs(logs);
            },
            (err) => {
                console.error("TimeLogs Error:", err);
                // 初期ロード時の権限エラー等はここでキャッチ
            }
        );

        return () => unsubscribe();
    }, []);

    /**
     * 作業完了時にログを保存
     */
    const addTimeLog = async (log) => {
        setLoading(true);
        try {
            await timeLogService.addTimeLog(log);
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
