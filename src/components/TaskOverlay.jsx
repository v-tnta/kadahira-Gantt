import React, { useState, useEffect } from 'react'
import TaskAnalytics from './TaskAnalytics'
import GanttChart from './GanttChart'

/**
 * TaskOverlay コンポーネント (モーダル)
 * タスクの詳細（分析とガントチャート）を表示するオーバーレイです。
 * タスクの編集・論理削除機能も含みます。
 */
const TaskOverlay = ({ isOpen, onClose, task, logs, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', deadline: '', estimatedMinutes: 0 });

    // モーダルが開くたび、またはタスクが変わるたびにフォームを初期化
    useEffect(() => {
        if (task) {
            // 締切日の形式変換 (Firestore Timestamp -> YYYY-MM-DD or String -> YYYY-MM-DD)
            let formattedDeadline = '';
            if (task.deadline) {
                if (task.deadline.seconds) {
                    // Timestamp
                    formattedDeadline = new Date(task.deadline.seconds * 1000).toISOString().split('T')[0];
                } else if (task.deadline instanceof Date) {
                    // Date Object
                    formattedDeadline = task.deadline.toISOString().split('T')[0];
                } else {
                    // String ("YYYY-MM-DD") or other
                    formattedDeadline = task.deadline;
                }
            }

            setEditForm({
                title: task.title,
                deadline: formattedDeadline,
                estimatedMinutes: task.estimatedMinutes
            });
            setIsEditing(false); // モーダルを開いたときは閲覧モード
        }
    }, [task, isOpen]);

    if (!isOpen || !task) return null;

    const handleSave = async () => {
        if (!editForm.title.trim()) return alert("タイトルは必須です");

        // 更新処理
        await onUpdate(task.id, {
            title: editForm.title,
            estimatedMinutes: Number(editForm.estimatedMinutes),
            // Dateオブジェクトとして保存（FirestoreでTimestampになる）
            deadline: editForm.deadline ? new Date(editForm.deadline) : null
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await onDelete(task.id);
        onClose(); // 削除したら閉じる
    };

    // 表示用の日付フォーマット関数
    const formatDate = (dateVal) => {
        if (!dateVal) return '未設定';
        if (dateVal.seconds) {
            return new Date(dateVal.seconds * 1000).toLocaleDateString();
        }
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? dateVal : d.toLocaleDateString();
    };

    return (
        // 背景 (Backdrop)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        >
            {/* モーダル本体 */}
            <div
                className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl m-4 p-6 relative animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダーエリア */}
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            // --- 編集モード ---
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none p-1"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="タスク名"
                                />
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">締切:</span>
                                        <input
                                            type="date"
                                            className="border rounded px-2 py-1 text-sm"
                                            value={editForm.deadline}
                                            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">見積(分):</span>
                                        <input
                                            type="number"
                                            className="border rounded px-2 py-1 text-sm w-20"
                                            value={editForm.estimatedMinutes}
                                            onChange={(e) => setEditForm({ ...editForm, estimatedMinutes: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleSave}
                                        className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300"
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- 閲覧モード ---
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-500">
                                        {task.status || 'TODO'}
                                    </span>
                                    {/* 編集アイコン */}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-gray-400 hover:text-blue-600 p-1"
                                        title="編集"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    {/* 削除アイコン */}
                                    <button
                                        onClick={handleDelete}
                                        className="text-gray-400 hover:text-red-600 p-1"
                                        title="削除"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    締切: {formatDate(task.deadline)}
                                </p>
                            </>
                        )}
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
