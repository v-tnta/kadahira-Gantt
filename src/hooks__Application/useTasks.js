import { useState, useEffect } from 'react';
import * as taskService from '../services/taskService';

/**
 * タスク管理のカスタムフック (Application Layer)
 * UIとInfrastructure (Service) の仲介役。
 * データの監視、状態管理、エラーハンドリングを行います。
 */
export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // データの監視を開始
    useEffect(() => {
        const unsubscribe = taskService.subscribeToTasks(
            (newTasks) => {
                setTasks(newTasks);
                setLoading(false);
            },
            (err) => {
                console.error("Task Subscription Error:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    /**
     * 新しいタスクを追加
     */
    const addTask = async (task) => {
        try {
            await taskService.addTask(task);
            console.log("タスク追加成功");
        } catch (err) {
            console.error("タスク追加エラー:", err);
            alert("タスクの追加に失敗しました");
        }
    };

    /**
     * タスクを更新
     */
    const updateTask = async (taskId, updates) => {
        try {
            await taskService.updateTask(taskId, updates);
            console.log("タスク更新成功");
        } catch (err) {
            console.error("タスク更新エラー:", err);
            alert("タスクの更新に失敗しました");
        }
    };

    /**
     * タスクを論理削除（非表示）
     */
    const deleteTask = async (taskId) => {
        if (!window.confirm("このタスクを目録から外しますか？（データは残ります）")) return;

        try {
            await taskService.softDeleteTask(taskId);
            console.log("タスク論理削除成功");
        } catch (err) {
            console.error("タスク削除エラー:", err);
            alert("タスクの削除に失敗しました");
        }
    };

    /**
     * タスクを完全削除 (Cascade)
     */
    const completelyDeleteTask = async (taskId) => {
        try {
            await taskService.completelyDeleteTask(taskId);
            console.log("タスクと関連ログの完全削除に成功");
        } catch (err) {
            console.error("完全削除エラー:", err);
            throw err;
        }
    };

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        completelyDeleteTask,
        loading,
        error
    };
};
