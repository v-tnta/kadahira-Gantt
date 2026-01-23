import React, { useState, useEffect, useRef } from 'react'
import { useTimeLogs } from '../hooks/useTimeLogs'

/**
 * Timerコンポーネント
 * 作業時間を計測し、Firestoreにログを保存します。
 * 事後報告（手動入力）や、サブタスク名の入力強制機能を含みます。
 */
const Timer = ({ tasks, onUpdateTask }) => {
    const { addTimeLog } = useTimeLogs();

    // タイマー用ステート
    const [activeTaskId, setActiveTaskId] = useState('');
    const [subTaskName, setSubTaskName] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [accumulatedSeconds, setAccumulatedSeconds] = useState(0); // 一時停止までの累積時間
    const [startTime, setStartTime] = useState(null); // 現在のセッションの開始時刻

    // モーダル用ステート
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // データ一時保存用（バリデーション待ちの間など）
    const [pendingLogData, setPendingLogData] = useState(null);
    const [manualData, setManualData] = useState({ taskId: '', subTaskName: '', durationMinutes: '' });

    const intervalRef = useRef(null);

    // タイマー計測ロジック
    useEffect(() => {
        if (isActive && startTime) {
            intervalRef.current = setInterval(() => {
                const now = new Date();
                // 累積時間 + 現在のセッション経過時間
                const currentSessionSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                setElapsedSeconds(accumulatedSeconds + currentSessionSeconds);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isActive, startTime, accumulatedSeconds]);

    // 開始（再開）ボタン
    const handleStart = () => {
        if (!activeTaskId) {
            alert("タスクを選択してください");
            return;
        }
        setStartTime(new Date());
        setIsActive(true);
    };

    // 一時停止ボタン
    const handlePause = () => {
        setIsActive(false);
        const now = new Date();
        // 現在のセッション時間を累積に加算
        const currentSessionSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const newAccumulated = accumulatedSeconds + currentSessionSeconds;

        setAccumulatedSeconds(newAccumulated);
        setElapsedSeconds(newAccumulated); // 表示を更新（念のため）
        setStartTime(null);
    };

    // きろく（保存）ボタン
    const handleRecordClick = async () => {
        const durationSeconds = elapsedSeconds;

        // 終了時刻 = 現在時刻。開始時刻 = 現在時刻 - 経過時間 (として記録)
        const endTime = new Date();
        const calculatedStartTime = new Date(endTime.getTime() - durationSeconds * 1000);

        const logData = {
            taskId: activeTaskId,
            subTaskName: subTaskName,
            startTime: calculatedStartTime,
            endTime: endTime,
            durationSeconds: durationSeconds
        };

        // サブタスク名が空なら、確認モーダルを開く
        if (!subTaskName.trim()) {
            setPendingLogData(logData);
            setIsConfirmModalOpen(true);
        } else {
            // 入力済みならそのまま保存
            await saveLog(logData);
        }
    };

    // 実際に保存するヘルパー関数
    const saveLog = async (data) => {
        await addTimeLog(data);

        // Auto-Status Logic:
        // タスクのステータスが 'TODO' なら 'DOING' に自動更新する
        const currentTask = tasks.find(t => t.id === data.taskId);
        if (currentTask && currentTask.status === 'TODO' && onUpdateTask) {
            console.log(`Auto-update status for task ${currentTask.title} to DOING`);
            await onUpdateTask(currentTask.id, { status: 'DOING' });
        }

        // リセット
        setElapsedSeconds(0);
        setAccumulatedSeconds(0);
        setStartTime(null);
        setIsActive(false);
        setSubTaskName('');
        setPendingLogData(null);
    };

    // サブタスク強制入力モーダルからの保存
    const handleConfirmSave = async () => {
        if (!subTaskName.trim()) {
            alert("作業内容を入力してください");
            return;
        }
        // pendingDataに名前を追記して保存
        await saveLog({ ...pendingLogData, subTaskName: subTaskName });
        setIsConfirmModalOpen(false);
    };

    // 事後報告の保存
    const handleManualSave = async () => {
        if (!manualData.taskId || !manualData.durationMinutes) {
            alert("タスクと時間を入力してください");
            return;
        }

        const durationSec = Number(manualData.durationMinutes) * 60;
        const end = new Date();
        const start = new Date(end.getTime() - durationSec * 1000); // 現在時刻から逆算

        const log = {
            taskId: manualData.taskId,
            subTaskName: manualData.subTaskName || '事後報告',
            startTime: start,
            endTime: end,
            durationSeconds: durationSec
        };

        await addTimeLog(log);

        // Auto-Status Logic (事後報告でも適用)
        const currentTask = tasks.find(t => t.id === log.taskId);
        if (currentTask && currentTask.status === 'TODO' && onUpdateTask) {
            await onUpdateTask(currentTask.id, { status: 'DOING' });
        }

        setIsManualModalOpen(false);
        setManualData({ taskId: '', subTaskName: '', durationMinutes: '' }); // リセット
    };

    // 時間フォーマット
    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className={`relative p-6 rounded-lg shadow-md mb-8 border-l-4 transition-colors duration-300 ${isActive ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-300'}`}>
            {/* ヘッダーエリア */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    ⏱ 作業タイマー
                    {isActive && <span className="text-sm font-normal text-blue-600 animate-pulse">● 計測中...</span>}
                    {!isActive && elapsedSeconds > 0 && <span className="text-sm font-normal text-orange-500">● 一時停止中</span>}
                </h2>
                {/* 事後報告ボタン */}
                <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded border border-gray-300"
                    disabled={isActive}
                >
                    ＋きろく（事後報告）
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                {/* タスク選択 */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-1">取り組むタスク</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        value={activeTaskId}
                        onChange={(e) => setActiveTaskId(e.target.value)}
                        disabled={isActive || elapsedSeconds > 0} // 計測中または一時停止中は変更不可
                    >
                        <option value="">タスクを選択してください</option>
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>{task.title}</option>
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
                        disabled={isActive || isConfirmModalOpen} // モーダル中は入力不可（一時停止中は編集可で良いか？いったんそのままで）
                    />
                </div>
            </div>

            {/* タイマー表示と操作ボタン */}
            <div className="mt-6 flex items-center justify-between bg-gray-100 p-4 rounded-md">
                <div className={`text-4xl font-mono font-bold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                    {formatTime(elapsedSeconds)}
                </div>

                <div className="flex gap-2">
                    {!isActive ? (
                        <>
                            <button
                                onClick={handleStart}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-full shadow transition transform hover:scale-105"
                            >
                                {elapsedSeconds > 0 ? 'RESUME' : 'START'}
                            </button>

                            {/* 一時停止中で、かつ時間が記録されている場合のみ「きろく」ボタンを表示 */}
                            {elapsedSeconds > 0 && (
                                <button
                                    onClick={handleRecordClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full shadow transition transform hover:scale-105 animate-bounce-short"
                                >
                                    きろく
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={handlePause}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-8 rounded-full shadow transition transform hover:scale-105"
                        >
                            STOP (Pause)
                        </button>
                    )}
                </div>
            </div>

            {/* --- サブタスク入力確認モーダル --- */}
            {isConfirmModalOpen && (
                <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">作業名を入力してください</h3>
                    <p className="text-sm text-gray-500 mb-4">後で振り返るために具体的な内容を書きましょう。</p>
                    <input
                        type="text"
                        placeholder="例: 文献調査"
                        className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-blue-500"
                        value={subTaskName}
                        onChange={(e) => setSubTaskName(e.target.value)}
                        autoFocus
                    />
                    <button
                        onClick={handleConfirmSave}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        保存する
                    </button>
                </div>
            )}

            {/* --- 事後報告モーダル (簡易版) --- */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setIsManualModalOpen(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">作業のきろく (事後報告)</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">タスク</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={manualData.taskId}
                                    onChange={e => setManualData({ ...manualData, taskId: e.target.value })}
                                >
                                    <option value="">選択してください</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">作業内容</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    placeholder="例: 昨日やった分"
                                    value={manualData.subTaskName}
                                    onChange={e => setManualData({ ...manualData, subTaskName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">作業時間 (分)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    placeholder="60"
                                    value={manualData.durationMinutes}
                                    onChange={e => setManualData({ ...manualData, durationMinutes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setIsManualModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">キャンセル</button>
                            <button onClick={handleManualSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">報告する</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Timer
