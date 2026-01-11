import React from 'react'
import Layout from './components/Layout'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import { useTasks } from './hooks/useTasks' // カスタムフックをインポート
import './App.css'

function App() {
  // カスタムフックから「タスクのデータ」と「追加機能」を受け取る
  const { tasks, addTask, loading, error } = useTasks();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">タスク管理</h2>
          <p className="text-gray-500">新しいタスクを追加して、時間を管理しましょう。</p>
        </div>

        {/* TaskFormには「タスクを追加する関数」を渡す（お願いする権利） */}
        <TaskForm addTask={addTask} />

        {/* TaskListには「タスクのデータ」を渡す（表示する情報） */}
        <TaskList tasks={tasks} loading={loading} error={error} />
      </div>
    </Layout>
  )
}

export default App
