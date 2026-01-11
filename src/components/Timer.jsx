import React, { useState, useEffect, useRef } from 'react'
import { useTimeLogs } from '../hooks/useTimeLogs'

/**
 * Timerコンポーネント
 * 作業時間を計測し、Firestoreにログを保存します。
 */
const Timer = ({ tasks = [] }) => {
    const { addTimeLog } = useTimeLogs(); // ログ保存用のフック

    const [activeTaskId, setActiveTaskId] = useState('');
    const [subTaskName, setSubTaskName] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime, setStartTime] = useState(null);

    const intervalRef = useRef(null);

    // タイマーのカウントアップ処理
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                // startした時間からの経過時間を計算（正確性のためDate差分推奨だが、簡易的にカウントアップ）
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive]);

    // 開始ボタン
    const handleStart = () => {
        if (!activeTaskId) {
            alert("タスクを選択してください");
            return;
        }
        setStartTime(new Date());
        setIsActive(true);
    };

    // 停止（＆保存）ボタン
    const handleStop = async () => {
        setIsActive(false);
        const endTime = new Date();

        // ログデータの作成
        const logData = {
            taskId: activeTaskId,
            subTaskName: subTaskName,
            startTime: startTime,
            endTime: endTime,
            durationSeconds: elapsedSeconds
        };

        // Firestoreへ保存
        await addTimeLog(logData);

        // リセット
        setElapsedSeconds(0);
        setStartTime(null);
        setSubTaskName(''); // サブタスク名は毎回変える想定でリセット（好みで残してもOK）
    };

    // "HH:MM:SS" 形式に変換するヘルパー
    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className={`p-6 rounded-lg shadow-md mb-8 border-l-4 transition-colors duration-300 ${isActive ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⏱ 作業タイマー
                {isActive && <span className="text-sm font-normal text-blue-600 animate-pulse">● 計測中...</span>}
            </h2>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* タスク選択 */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">取り組むタスク</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        value={activeTaskId}
                        onChange={(e) => setActiveTaskId(e.target.value)}
                        disabled={isActive} // 計測中は変更不可
                    >
                        <option value="">タスクを選択してください</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* サブタスク入力 */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">作業内容 (サブタスク)</label>
                    <input
                        type="text"
                        placeholder="例: 文献調査、下書き作成"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={subTaskName}
                        onChange={(e) => setSubTaskName(e.target.value)}
                        disabled={isActive}
                    />
                </div>
            </div>

            {/* タイマー表示と操作ボタン */}
            <div className="mt-6 flex items-center justify-between bg-gray-100 p-4 rounded-md">
                <div className={`text-4xl font-mono font-bold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                    {formatTime(elapsedSeconds)}
                </div>

                {!isActive ? (
                    <button
                        onClick={handleStart}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-full shadow transition transform hover:scale-105"
                    >
                        START
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded-full shadow transition transform hover:scale-105"
                    >
                        STOP
                    </button>
                )}
            </div>
        </div>
    )
}

export default Timer
