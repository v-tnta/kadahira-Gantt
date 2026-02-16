/**
 * タスク一覧コンポーネント
 * 親コンポーネント(App)から受け取った tasks データをもとにリストを表示します。
 * スクロール機能、ローディング表示、エラー表示を含みます。
 */
const TaskList = ({ tasks, timeLogs, loading, error, onTaskClick, onUpdateTask, onDeleteTask, showHidden, onToggleHidden }) => {
    if (loading) {
        return <div className="text-center p-8 text-gray-500">読み込み中...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">エラーが発生しました。設定を確認してください。</div>;
    }

    // 時間フォーマット関数 (String, Date, Timestamp対応)
    const formatDate = (val) => {
        if (!val) return '未設定';
        if (typeof val === 'string') return val;
        if (val instanceof Date) return val.toLocaleDateString();
        if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
        return val;
    };

    // 時間負債の計算ヘルパー
    const getTimeDebt = (task) => {
        // このタスクに関連するログのみ抽出
        const taskLogs = timeLogs?.filter(log => log.taskId === task.id) || [];
        const totalSeconds = taskLogs.reduce((sum, log) => sum + log.durationSeconds, 0);
        const totalMinutes = Math.floor(totalSeconds / 60);

        const diff = totalMinutes - task.estimatedMinutes;
        return diff;
    };

    // ハンドラ: 完了ボタン
    const handleComplete = (e, task) => {
        e.stopPropagation(); // 行クリックイベントの伝播を止める
        if (window.confirm(`タスク「${task.title}」を完了しますか？`)) {
            onUpdateTask(task.id, { status: 'DONE' });
        }
    };

    // ハンドラ: 非表示ボタン
    const handleDelete = (e, task) => {
        e.stopPropagation();
        onDeleteTask(task.id);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">タスク一覧 </h2>
                <label className="flex items-center cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    <input
                        type="checkbox"
                        checked={showHidden}
                        onChange={onToggleHidden}
                        className="mr-2 cursor-pointer"
                    />
                    非表示も表示
                </label>
            </div>

            {/* タスクリスト表示エリア: 高さ制限とスクロールを追加 */}
            <div className="space-y-3 max-h-[270px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">タスクはまだありません。</p>
                ) : (
                    tasks.map((task) => {
                        const debt = getTimeDebt(task);
                        return (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className={`cursor-pointer hover:shadow-md transition p-4 border rounded-lg flex justify-between items-center ${!task.isVisible ? 'bg-gray-200 opacity-60' :
                                    task.status === 'DONE' ? 'bg-gray-100 opacity-80' : 'bg-white'
                                    }`}
                            >
                                <div>
                                    <h3 className={`font-medium ${task.status === 'DONE' ? 'text-gray-500' : 'text-gray-800'}`}>
                                        {task.title}
                                        {!task.isVisible && <span className="text-xs ml-2 text-red-500">(非表示)</span>}
                                    </h3>
                                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                        <span>⏳ 見積: {task.estimatedMinutes}分</span>
                                        <span>📅 締切: {formatDate(task.deadline)}</span>
                                    </div>
                                </div>

                                {/* ステータス・操作エリア */}
                                <div className="flex items-center gap-4">

                                    {/* DOINGの場合のみ時間負債を表示 */}
                                    {task.status === 'DOING' && (
                                        <span className={`text-sm font-bold w-12 text-right ${debt > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {debt > 0 ? `+${debt}` : debt}分
                                        </span>
                                    )}


                                    {/* 操作ボタン */}
                                    <div className="flex items-center gap-1">
                                        {task.status !== 'DONE' ? (
                                            <button
                                                onClick={(e) => handleComplete(e, task)}
                                                className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition"
                                                title="完了にする"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleDelete(e, task)}
                                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
                                                title="リストから非表示"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>



                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'TODO' ? 'bg-gray-200 text-gray-700' :
                                        task.status === 'DOING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default TaskList
