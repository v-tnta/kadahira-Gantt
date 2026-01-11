/**
 * タスク一覧コンポーネント
 * 親コンポーネント(App)から受け取った tasks データをもとにリストを表示します。
 * スクロール機能、ローディング表示、エラー表示を含みます。
 */
const TaskList = ({ tasks, loading, error, onTaskClick }) => {
    if (loading) {
        return <div className="text-center p-8 text-gray-500">読み込み中...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">エラーが発生しました。設定を確認してください。</div>;
    }

    // 日付フォーマット関数 (String, Date, Timestamp対応)
    const formatDate = (val) => {
        if (!val) return '未設定';
        if (typeof val === 'string') return val;
        if (val instanceof Date) return val.toLocaleDateString();
        if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
        return val;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">タスク一覧</h2>

            {/* タスクリスト表示エリア: 高さ制限とスクロールを追加 */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">タスクはまだありません。</p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => onTaskClick(task)}
                            className={`cursor-pointer hover:shadow-md transition p-4 border rounded-lg flex justify-between items-center ${task.status === 'DONE' ? 'bg-gray-100 opacity-70' : 'bg-white'
                                }`}
                        >
                            <div>
                                <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {task.title}
                                </h3>
                                <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                    <span>⏳ 見積: {task.estimatedMinutes}分</span>
                                    <span>📅 締切: {formatDate(task.deadline)}</span>
                                </div>
                            </div>

                            {/* ステータスバッジ */}
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'TODO' ? 'bg-gray-200 text-gray-700' :
                                    task.status === 'DOING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TaskList
