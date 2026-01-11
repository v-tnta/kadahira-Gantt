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
      <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 左カラム (PC時: 1/3幅) - Timer & Form */}
        <div className="md:col-span-1 flex flex-col gap-6 md:overflow-y-auto md:pr-2 custom-scrollbar">
          <div className="md:hidden mb-4 text-center">
            {/* Mobileのみここにタイトルなどを出す場合 */}
          </div>

          <div>
            <Timer tasks={tasks} />
          </div>

          <div>
            <TaskForm addTask={addTask} />
          </div>
        </div>

        {/* 右カラム (PC時: 2/3幅) - TaskList */}
        <div className="md:col-span-2 md:overflow-y-auto md:pl-2 custom-scrollbar">
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onTaskClick={handleTaskClick}
          />
        </div>

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
