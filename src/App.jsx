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
  const { tasks, addTask, loading, error } = useTasks();
  const { timeLogs } = useTimeLogs(); // 全体のログを取得

  // モーダル用のステート
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

  // 選択されたタスクに関連するログだけをフィルタリング
  const selectedTaskLogs = selectedTask
    ? timeLogs.filter(log => log.taskId === selectedTask.id)
    : [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">タスク管理</h2>
          <p className="text-gray-500">新しいタスクを追加して、時間を管理しましょう。</p>
        </div>

        {/* Timerコンポーネント: タスクリストを渡して選択できるようにする */}
        <Timer tasks={tasks} />

        {/* TaskFormには「タスクを追加する関数」を渡す */}
        <TaskForm addTask={addTask} />

        {/* TaskListにはクリック時のハンドラを渡す */}
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onTaskClick={handleTaskClick}
        />

        {/* タスク詳細モーダル (常にDOMには居るが、isOpenがtrueの時だけ表示される) */}
        <TaskOverlay
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          logs={selectedTaskLogs}
        />
      </div>
    </Layout>
  )
}

export default App
