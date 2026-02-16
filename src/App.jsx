import React from 'react'
import Layout from './components/Layout'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import Timer from './components/Timer' // Timerコンポーネントを追加
import TaskOverlay from './components/TaskOverlay'
import { useTasks } from './hooks/useTasks'
import { useTimeLogs } from './hooks/useTimeLogs' // ログ取得用に追加
import './App.css'

function App() {
  const { tasks, addTask, updateTask, deleteTask, completelyDeleteTask, loading, error } = useTasks();
  const { timeLogs } = useTimeLogs(); // 全体のログを取得

  // 非表示タスクの表示切り替え
  const [showHidden, setShowHidden] = React.useState(false);

  // 表示用タスクと、タイマー用（アクティブのみ）タスクの切り分け
  const visibleTasks = React.useMemo(() => tasks.filter(t => t.isVisible !== false), [tasks]);
  const tasksForList = showHidden ? tasks : visibleTasks;

  // モーダル用のステート (TaskOverlay: 詳細/編集)
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // タスクがクリックされた時の処理
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // 選択されたタスクに関連するログだけをフィルタリング (TaskOverlay用)
  const selectedTaskLogs = selectedTask
    ? timeLogs.filter(log => log.taskId === selectedTask.id)
    : [];

  return (
    <Layout tasks={visibleTasks} onTaskClick={handleTaskClick}>
      <div className="flex flex-col gap-8">
        {/* 上部: 新規タスク追加 */}
        <div>
          <TaskForm addTask={addTask} />
        </div>

        {/* 下部: タスク一覧 */}
        <div>
          <TaskList
            tasks={tasksForList}
            timeLogs={timeLogs}
            loading={loading}
            error={error}
            onTaskClick={handleTaskClick}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            showHidden={showHidden}
            onToggleHidden={() => setShowHidden(!showHidden)}
          />
        </div>

        {/* タスク詳細モーダル */}
        <TaskOverlay
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          logs={selectedTaskLogs}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onPhysicalDelete={completelyDeleteTask}
        />
      </div>
    </Layout>

  )
}

export default App
