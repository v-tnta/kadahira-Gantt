## 📅 2026/01/10 システム設計の確定と開発環境の準備

### **【実装内容🔧】**
- `SystemDesign.md` の完成
  - ディレクトリ構成（`src/components/`, `src/hooks/`, `src/lib/`）の策定
  - Firestoreデータ構造（`tasks`, `timeLogs`）の設計
  - コンポーネント設計（`TaskForm`, `TaskList`, `Timer`, `Dashboard`, `GanttChart`）の明確化
- 段階的実装方針（UI→ロジック→DB）の合意

### **【技術的な判断🤔】**
- **ロジック分離の徹底**: コンポーネント内で直接Firestore操作（`onSnapshot`等）を行わず、カスタムフック（`useTasks`, `useTimeLogs`）にカプセル化することを決定。
  - **理由**: UIとロジックの責務を明確に分けることで、コードの可読性・保守性を向上。初心者が「どこに何があるか」を理解しやすくする。
- **Firestoreスキーマ設計**: `tasks`に`deadline`を追加し、`timeLogs`は別コレクションで管理。
  - **理由**: NoSQLの柔軟性を活かしつつ、リレーションをIDで管理する標準的な設計。
  - tasksの`documentId`が`timeLogs`の`taskId`として参照される。

### **【遭遇した問題と解決💡】**
- **問題**: `npm`コマンドが認識されない（`CommandNotFoundException`）。
  - **原因**: Node.jsがインストールされていない、またはPATHに含まれていない。
  - **対応**: ユーザーに環境構築を依頼（この時点では未解決で一旦中断）。


### **【重要なコードやロジック💾】**

カスタムフックによるロジック隠蔽の概念：
```javascript
// ❌ Bad: コンポーネント内でFirestore直接操作
function TaskList() {
  useEffect(() => { onSnapshot(collection(db, "tasks"), ...) }, []);
  // ... 見た目のコードと通信コードが混在
}

// ✅ Good: カスタムフックで分離
function TaskList() {
  const tasks = useTasks(); // 1行でデータ取得完了
  return <div>{tasks.map(...)}</div>;
}
```

### **【次のステップ👯】**
- Node.js/npm環境の構築・PATH設定の確認
- Viteプロジェクト初期化 (`npx create-vite`)
- Tailwind CSS導入
- Phase 1: UI実装（ダミーデータで画面表示）


## 📅 2026/01/11 Kadahira-Ganttアプリの開発：プロジェクト構築から実績ガントチャートまでの実装

### **【実装内容🔧】**

#### **1. プロジェクト初期構築・環境セットアップ**
- **実装計画の作成**
  - `implementation_plan.md`と`task.md`の作成
  - システム設計書に基づく段階的実装方針の文書化
- **Viteプロジェクトのセットアップ**
  - `npm create vite` による React プロジェクトの初期化
  - `temp-app`経由での安全なプロジェクト生成（既存ドキュメント保持）
  - 既存ドキュメント（`SystemDesign.md`, `requirements.md`）を`docs/`ディレクトリに退避
- **依存関係のインストール**
  - Tailwind CSS v4 & PostCSS & Autoprefixer
  - Firebase SDK (`@tailwindcss/postcss`対応)
- **設定ファイルの作成**
  - `tailwind.config.js`: Tailwind設定（content pathの指定）
  - `postcss.config.js`: PostCSS設定
  - `src/index.css`: Tailwindディレクティブの追加
- **ディレクトリ構造の構築**
  - `src/components/`, `src/hooks/`, `src/lib/`フォルダの作成

#### **2. 基本コンポーネントの作成**
- **Layout & Form Components**
  - `Layout.jsx`: ヘッダー・フッター含む共通レイアウト
  - `TaskForm.jsx`: タスク登録フォーム（タイトル、見積もり時間、締切入力）
  - `TaskList.jsx`: タスク一覧表示（ステータスバッジ付き）
- **データ管理層**
  - `lib/firebase.js`: Firebase初期化設定
  - `hooks/useTasks.js`: タスクCRUD操作のカスタムフック（useState版 → Firestore版）
- **UI改善**
  - タスクリスト内スクロール実装（`max-h-[500px] overflow-y-auto`）
  - カスタムスクロールバースタイル追加

#### **3. Firestore接続とリアルタイム同期**
- リアルタイム同期（`onSnapshot`）実装
- ローディング・エラー状態管理
- セットアップガイド作成（`docs/FIREBASE_SETUP.md`）

#### **4. 実績ガントチャートと高機能タイマーの実装**
- **コンポーネント構成の変更（UI/UX）**
  - 「常時表示ダッシュボード」案を廃止し、**タスククリック時に詳細モーダル（`TaskOverlay.jsx`）が開く**形式に変更
  - モーダル内でタスクごとの作業実績を集中して振り返れるUIを実現
- **実績ガントチャートの実装（`GanttChart.jsx`）**
  - **積み上げ式表示**: 一般的な「時刻ベース（カレンダー通り）」ではなく、**「経過時間ベース（積み上げ）」**に変更
  - 休憩時間などの空白を詰め、純粋な作業の積み重ねを可視化
  - X軸は経過時間（0分、30分、60分...）で表示
- **レスポンシブ・スケーリング機能**
  - チャートが長くなった場合でもスクロールさせず、**コンテナ幅に合わせて自動縮小**するロジックを実装
  - 全体像を一目で把握できるようにした
- **タイマー機能の実装（`Timer.jsx`）**
  - 作業時間を正確に計測し、Firestoreに保存する機能
  - タイムログの開始・停止・記録の管理

#### **5. バグ修正**
- `GanttChart.jsx`のソート順バグを修正（降順→昇順）

### **【技術的な判断🤔】**

#### **プロジェクト構築段階**
- **temp-app戦略の採用**
  - **問題**: `npm create vite` は空のディレクトリを要求するが、既にMarkdownファイルが存在
  - **判断**: 一時ディレクトリ `temp-app` でプロジェクトを生成し、その後ルートディレクトリに移動する手法を採用
  - **理由**: 既存ドキュメントを保持したまま、Viteのスキャフォールディング機能を最大限活用するため

- **手動での設定ファイル作成**
  - `npx tailwindcss init -p` がPowerShell環境で失敗したため、設定ファイルを手動作成
  - **理由**: 環境依存のエラーを回避し、作業を進めるため。自動生成と同等の設定内容を手動で記述することで問題なく動作

#### **アーキテクチャ設計**
- **Props Drilling（バケツリレー）の採用**
  - `App.jsx`を司令塔とし、`useTasks`から得たデータと関数を子コンポーネントに配る構成
  - **理由**: データフローが追いやすく、初心者にも「どこから何が来ているか」が明確。Contextは過剰と判断

- **Tailwind CSS v4への対応**
  - `postcss.config.js`で`@tailwindcss/postcss`を使用、`index.css`では`@import "tailwindcss"`構文に統一
  - **理由**: v4の新しいプラグインシステムに準拠。公式が推奨する方法に従うことで将来的な互換性を確保

- **スクロール制御の設計**
  - 画面全体ではなく、タスクリスト部分のみスクロール可能に
  - **理由**: フォームやヘッダーが常に見えることで、操作性が向上。一般的なSaaSアプリの標準UI

#### **UI/UX設計**
- **モーダルUI採用の理由**
  - 当初検討していた「ダッシュボード常時表示」は、画面が煩雑になりユーザーの集中を妨げる可能性があった
  - タスクごとの詳細情報を必要な時だけ表示することで、**コンテキストに応じた情報提示**を実現
  - 一般的なタスク管理ツール（Notion、Asana等）と同様のUXパターンで、学習コストを削減

- **積み上げ式ガントチャートの採用**
  - **従来の選択肢**: カレンダー通りの時刻ベース表示（9:00、10:00...）
  - **採用した方式**: 経過時間ベースの積み上げ表示（0分、30分、60分...）
  - **理由**: 
    - 「時間負債の可視化」というアプリコンセプトに合致
    - 実際の作業時間の「積み重ね」を直感的に把握できる
    - 休憩や中断の影響を排除し、純粋な作業量を可視化

- **自動スケーリングの実装判断**
  - **問題**: 作業時間が長いと、チャートが横に伸びすぎて全体が見えなくなる
  - **検討した選択肢**:
    1. 横スクロールで対応
    2. 固定幅に収まるよう自動縮小
  - **採用**: オプション2（自動縮小）
  - **理由**: 
    - 全体の作業パターンを一目で把握することが最優先
    - スクロール操作は認知負荷が高く、「振り返り」の目的に反する

### **【遭遇した問題と解決💡】**

#### **環境構築段階**
1. **問題**: PowerShellで `&&` によるコマンドチェーンが動作しない
   ```
   npm install && npm install -D tailwindcss postcss autoprefixer && ...
   ```
   - **原因**: PowerShellは `&&` をサポートしていない（Bash構文）
   - **解決**: コマンドを個別に実行するように分割

2. **問題**: `npx tailwindcss init -p` が失敗
   ```
   npm error could not determine executable to run
   ```
   - **原因**: npm cache問題 or インストール不完全
   - **解決**: `tailwind.config.js` と `postcss.config.js` を手動で作成し、標準的な設定を記述

3. **問題**: `temp-app` のファイル移動で一部失敗
   - **原因**: PowerShellの `Move-Item` がディレクトリマージに対応していない（同名フォルダが既に存在する場合）
   - **解決**: エラーが出たものの、重要なファイル（`package.json`, `vite.config.js`等）は正常に移動完了。残った空フォルダは削除

#### **Tailwind CSS v4統合**
4. **問題**: Tailwind CSS v4で`postcss`プラグインエラー
   ```
   [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
   ```
   - **原因**: Tailwind v4ではプラグインが分離され、`@tailwindcss/postcss`が必要に
   - **解決**: `npm install -D @tailwindcss/postcss`を実行し、`postcss.config.js`を以下に修正：
     ```javascript
     export default {
       plugins: {
         '@tailwindcss/postcss': {},
         autoprefixer: {},
       },
     }
     ```

#### **コンポーネント実装段階**
5. **問題**: `App.jsx`でSyntax Errorが発生（`export default`が無効）
   - **原因**: コード編集時に誤ってMarkdownのコードブロック記号（` ``` `）がファイルに混入
   - **解決**: 不要な文字列を削除

6. **問題**: `TaskList.jsx`で閉じカッコ不足
   - **原因**: 自動編集時にネストが深く、括弧の対応を誤った
   - **解決**: ユーザーが手動で`))}`を`)))}`に修正（感謝！）

#### **ガントチャート実装段階**
7. **問題**: `GanttChart.jsx` でバーの表示順が逆（新しい作業が左に来る）
   - **原因**: ソート処理が `b.startTime - a.startTime`（降順）になっていた
   ```javascript
   const sorted = [...logs].sort((a, b) => b.startTime - a.startTime); // ❌ 降順
   ```
   - **解決**: `a.startTime - b.startTime` に修正（昇順 = 古い作業が左）
   ```javascript
   const sorted = [...logs].sort((a, b) => a.startTime - b.startTime); // ✅ 昇順
   ```

8. **問題**: 初期実装でガントチャートが想定より長くなり、UIが崩れる
   - **原因**: 作業時間が長い場合、固定のピクセル/分レートで描画すると数千pxになってしまう
   - **解決**: 動的スケーリングロジックを実装（詳細は下記コード参照）

9. **問題**: コンテナ幅の取得タイミングが不明確
   - **原因**: React のレンダリングタイミングとDOM要素のサイズ確定タイミングのズレ
   - **解決**: `useRef` と `useEffect` で初期マウント時にコンテナ幅を取得し、`useMemo` で再計算を最適化

### **【重要なコードやロジック💾】**

#### **設定ファイル**
**tailwind.config.js: content設定**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
- `content`配列で、Tailwindがスキャンする対象ファイルを指定
- `src/**/*.{js,ts,jsx,tsx}` により、全てのコンポーネントファイルでTailwindクラスが有効に

**index.css: Tailwindディレクティブ**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- Tailwindの各レイヤーをインポート。これにより全てのユーティリティクラスが使用可能に

#### **データフロー**
**Props によるデータフロー（バケツリレー）**
```javascript
// App.jsx: 司令塔
function App() {
  const { tasks, addTask, loading, error } = useTasks();
  return (
    <Layout>
      <TaskForm addTask={addTask} />  {/* 機能を渡す */}
      <TaskList tasks={tasks} loading={loading} error={error} />  {/* データを渡す */}
    </Layout>
  );
}
```

**useTasks.js: Firestoreリアルタイム監視**
```javascript
useEffect(() => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  
  // データが変わったら自動で再レンダリング
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(newTasks);
    setLoading(false);
  }, (err) => {
    setError(err);
    setLoading(false);
  });

  return () => unsubscribe(); // クリーンアップ（監視解除）
}, []);
```

#### **UI実装**
**スクロール制御**
```javascript
// TaskList.jsx
<div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
  {tasks.map(task => <TaskCard key={task.id} {...task} />)}
</div>
```

**モーダル表示の制御（`TaskOverlay.jsx`）**
```javascript
// タスクカードクリック時にモーダルを開く
const handleTaskClick = (task) => {
  setSelectedTask(task);
  setIsModalOpen(true);
};

// モーダル内で該当タスクの timeLogs のみ表示
const taskLogs = timeLogs.filter(log => log.taskId === selectedTask.id);
```

#### **ガントチャートロジック**
**自動スケーリングロジック（`GanttChart.jsx`）**
```javascript
// 実際のスケール計算: コンテナ幅に収まる最小スケール vs 標準スケール で小さい方を採用
const pixelsPerMin = useMemo(() => {
    if (!containerWidth || !ticks.length) return STANDARD_PIXELS_PER_MIN;
    
    // 全体を表示するのに必要な分の最大値（分）
    const maxMin = ticks[ticks.length - 1]; 
    
    // コンテナに収める場合のスケール (少し余白を見るため width - 20 くらいで計算)
    const fitScale = (containerWidth - 20) / maxMin;
    
    // 標準(3px)より小さくなる（＝縮小が必要）なら fitScale を使う
    return Math.min(STANDARD_PIXELS_PER_MIN, fitScale);
}, [containerWidth, ticks]);
```
**解説**:
- `STANDARD_PIXELS_PER_MIN`: 通常時の1分あたりのピクセル数（デフォルト3px）
- `maxMin`: 全作業時間の合計（分）
- `fitScale`: コンテナ幅に収めるために必要なスケール
- `Math.min()` により、「縮小が必要な場合のみ縮小する」ロジックを実現

**積み上げ式の位置計算**
```javascript
// 各作業ログのバーを「積み上げ」で配置
let cumulativeMin = 0; // 累積経過時間
sortedLogs.forEach(log => {
  const durationMin = (log.endTime - log.startTime) / 60000; // ミリ秒→分
  const left = cumulativeMin * pixelsPerMin; // 開始位置
  const width = durationMin * pixelsPerMin; // バーの幅
  
  // 次のバーはこの位置から開始
  cumulativeMin += durationMin;
});
```

### **【次のステップ👯】**
- **タイマー機能の改善**
  - 一時停止・再開機能の追加
  - バックグラウンドでの計測継続
- **ガントチャートの機能拡張**
  - ツールチップ表示（バーにホバーすると詳細情報を表示）
  - カラーコーディング（タスクのステータスや種類で色分け）
- **パフォーマンス最適化**
  - 大量の `timeLogs` がある場合の描画パフォーマンス改善
  - 仮想スクロールの検討
- **ユーザビリティ向上**
  - モーダルのアニメーション追加
  - キーボードショートカット対応（ESCキーで閉じる等）
- **タスクのステータス変更機能**: TODO → DOING → DONE への遷移ボタン追加
- **認証機能**: Firebase Authenticationでユーザーごとのデータ分離
