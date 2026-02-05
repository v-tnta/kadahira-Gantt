import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    where,
    getDocs,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../domain/task';

const COLLECTION_NAME = 'tasks';

/**
 * タスク一覧をリアルタイム監視する
 * @param {function} onUpdate - 更新時に呼び出されるコールバック (tasks: Task[])
 * @param {function} onError - エラー時に呼び出されるコールバック
 * @returns {function} unsubscribe - 監視解除用の関数
 */
export const subscribeToTasks = (onUpdate, onError) => {
    const tasksCollection = collection(db, COLLECTION_NAME);
    const q = query(tasksCollection, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
            return Task.fromFirestore(doc.id, doc.data());
        });
        onUpdate(tasks);
    }, onError);
};

/**
 * タスクを追加する
 * @param {Object} taskData - Taskエンティティ、またはオブジェクト
 */
export const addTask = async (taskData) => {
    const tasksCollection = collection(db, COLLECTION_NAME);
    // Taskエンティティから必要なデータだけ抽出、またはそのまま使う
    // ここではシンプルにオブジェクトとして扱う
    await addDoc(tasksCollection, {
        ...taskData,
        status: 'TODO',
        isVisible: true,
        createdAt: serverTimestamp()
    });
};

/**
 * タスクを更新する
 * @param {string} taskId
 * @param {Object} updates
 */
export const updateTask = async (taskId, updates) => {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, updates);
};

/**
 * タスクを論理削除する (isVisible = false)
 * @param {string} taskId
 */
export const softDeleteTask = async (taskId) => {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, { isVisible: false });
};

/**
 * タスクを完全に削除する (関連するTimeLogsも削除)
 * @param {string} taskId
 */
export const completelyDeleteTask = async (taskId) => {
    // 1. TimeLogsの削除 (Cascade) - ここでTimeLogsへの依存が発生してしまうが、
    // 本来はCloud FunctionまたはTimeLogService側で処理すべきかもしれない。
    // 今回は要件に従いここに記述するが、理想的にはTimeLogService.deleteByTaskId(taskId)などを呼びたい。
    // 一旦既存ロジックを移植。

    // Note: 本来はTransactionを使うべきだが、既存ロジックに合わせてBatchで実装
    const logsQuery = query(collection(db, 'timeLogs'), where('taskId', '==', taskId));
    const logsSnapshot = await getDocs(logsQuery);

    const batch = writeBatch(db);
    logsSnapshot.forEach((logDoc) => {
        batch.delete(logDoc.ref);
    });

    // 2. Task自体の削除
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    batch.delete(taskRef);

    await batch.commit();
};
