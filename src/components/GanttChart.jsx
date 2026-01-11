import React from 'react'

/**
 * GanttChart コンポーネント
 * 受け取ったログ(logs)を時系列のバーとして表示します。
 * モーダル内で、特定のタスクの作業履歴を表示するために使用します。
 */
const GanttChart = ({ logs = [] }) => {
    if (logs.length === 0) {
        return <p className="text-gray-400 text-sm p-4 text-center">作業ログがありません。</p>;
    }

    // チャートの表示範囲を決める（最初と最後のログの日時）
    const timestamps = logs.map(l => [l.startTime, l.endTime]).flat().filter(Boolean);
    if (timestamps.length === 0) return null;

    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));

    // 全体の秒数を計算（スケール計算用）
    const totalDuration = (maxTime - minTime) / 1000; // 秒

    // 日付フォーマット
    const formatDate = (date) => {
        return date.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-600 mb-2">作業タイムライン (実績)</h3>

            <div className="relative border-l-2 border-gray-200 pl-4 space-y-4">
                {logs.map((log) => {
                    if (!log.startTime || !log.endTime) return null;

                    // 経過時間（分）
                    const durationMin = Math.round((log.durationSeconds || 0) / 60);

                    return (
                        <div key={log.id} className="relative">
                            {/* ドット */}
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>

                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-sm">
                                <div className="flex justify-between text-gray-500 text-xs mb-1">
                                    <span>{formatDate(log.startTime)}</span>
                                    <span>{durationMin}分間</span>
                                </div>
                                <div className="font-medium text-gray-800">
                                    {log.subTaskName || '作業'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default GanttChart
