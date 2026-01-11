import React from 'react'
import TaskAnalytics from './TaskAnalytics'
import GanttChart from './GanttChart'

/**
 * TaskOverlay コンポーネント (モーダル)
 * タスクの詳細（分析とガントチャート）を表示するオーバーレイです。
 */
const TaskOverlay = ({ isOpen, onClose, task, logs }) => {
    if (!isOpen || !task) return null;

    return (
        // 背景 (Backdrop)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity" // backdrop-blur-sm: tailwind-cssにて背景半透明化するやつ
            onClick={onClose} // 背景クリックで閉じる
        >
            {/* モーダル本体 */}
            <div
                className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl m-4 p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // 中身クリックでは閉じない
            >
                {/* ヘッダー */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-500 mb-2">
                            {task.status || 'TODO'}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            締切: {task.deadline || '未設定'}
                        </p>
                    </div>

                    {/* 閉じるボタン */}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 分析データ (時間負債) */}
                <TaskAnalytics task={task} logs={logs} />

                {/* ガントチャート (作業ログ) */}
                <div className="mt-8">
                    <GanttChart logs={logs} />
                </div>
            </div>
        </div>
    )
}

export default TaskOverlay
