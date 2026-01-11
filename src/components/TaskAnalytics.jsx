import React from 'react'

/**
 * TaskAnalytics コンポーネント
 * タスクの「見積もり」と「実績」を比較し、時間負債を表示します。
 */
const TaskAnalytics = ({ task, logs = [] }) => {
    // 実績時間の合計 (分) を計算
    const totalActualMinutes = logs.reduce((acc, log) => {
        return acc + (log.durationSeconds || 0);
    }, 0) / 60;

    // 見積もり時間 (分)
    const estimatedMinutes = task.estimatedMinutes || 0;

    // 時間負債 (実績 - 見積もり)
    const debtMinutes = totalActualMinutes - estimatedMinutes;

    // 表示用のスタイルとテキスト
    const isOver = debtMinutes > 0;
    const debtColor = isOver ? 'text-red-500' : 'text-blue-500';
    const debtLabel = isOver ? '時間負債 (使いすぎ)' : '時間貯金 (余裕)';

    return (
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            {/* 見積もり */}
            <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">見積もり</p>
                <p className="text-xl font-bold text-gray-700">{estimatedMinutes}分</p>
            </div>

            {/* 実績 */}
            <div className="text-center border-l border-r border-gray-200">
                <p className="text-xs text-gray-500 mb-1">実績 (合計)</p>
                <p className="text-xl font-bold text-gray-700">{Math.round(totalActualMinutes)}分</p>
            </div>

            {/* 負債/貯金 */}
            <div className="text-center">
                <p className={`text-xs ${debtColor} mb-1 font-bold`}>{debtLabel}</p>
                <p className={`text-xl font-bold ${debtColor}`}>
                    {isOver ? '+' : ''}{Math.round(debtMinutes)}分
                </p>
            </div>
        </div>
    )
}

export default TaskAnalytics
