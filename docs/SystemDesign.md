# Kadahira - Gantt System Design Document

## 1. 概要
本アプリケーションは、学生の時間管理能力とメタ認知を向上させるためのツールです。
「見積もり」と「実績」の差分（時間負債）を可視化し、タイマーログから「実績ガントチャート」を自動生成します。

## 2. ファイル構造 (ディレクトリ構成)

```
src/
├── components/
│   ├── Layout.jsx         # ヘッダー・メインエリアを含む共通レイアウト
│   ├── TaskForm.jsx       # タスク登録・見積もり・締切入力
│   ├── TaskList.jsx       # タスク一覧・ステータス変更
│   ├── Timer.jsx          # アクティブタスクの計測・サブタスク入力
│   ├── Timer.jsx          # アクティブタスクの計測・サブタスク入力
│   ├── TaskOverlay.jsx    # タスク詳細モーダル (Dashboard & Ganttを含む)
│   ├── TaskAnalytics.jsx  # 時間負債の計算と表示
│   └── GanttChart.jsx     # タイマーログに基づく実績ガントチャート表示 (Overlay内で使用)
├── hooks/                 ## hook: UseStateやUseEffectのようなノリで、カスタムされたオリジナルのフローをコードにしたもの
│   ├── useTasks.js        # Firestore: tasksコレクションのCRUD
│   └── useTimeLogs.js     # Firestore: timeLogsコレクションのCRUD (## CRUD: Create, Read, Update, Deleteの四種類の機能)
├── lib/
│   └── firebase.js        # Firebase初期化設定
├── App.jsx                # ルーティング管理
└── main.jsx               # エントリーポイント
```

## 3. データ構造 (Firestore Schema)

### Collection: `tasks`
タスクの基本情報を管理します。

| Field | Type | Description |
|---|---|---|
| `documentId` | string | 自動生成ID |
| `title` | string | タスク名 |
| `estimatedMinutes` | number | 見積もり時間 (分) |
| `deadline` | timestamp | 締切日 |
| `status` | string | 'TODO', 'DOING', 'DONE' |
| `createdAt` | timestamp | 作成日時 |

### Collection: `timeLogs`
タイマーによる実行ログを管理します。ガントチャートの元データとなります。

| Field | Type | Description |
|---|---|---|
| `documentId` | string | 自動生成ID |
| `taskId` | string | `tasks` ドキュメントへの参照ID |
| `subTaskName` | string | (Option) その時行っていた具体的な作業名 |
| `startTime` | timestamp | 計測開始時刻 |
| `endTime` | timestamp | 計測終了時刻 |
| `durationSeconds` | number | 実働時間 (秒) - 集計算出用 |
| `createdAt` | timestamp | ログ作成日時 |

## 4. コンポーネント詳細設計

### 4.1 TaskForm
- **機能**: ユーザーがタスクを登録する。
- **UI要素**:
  - タイトル入力 (Text)
  - 見積もり時間入力 (Number)
  - 締切日選択 (Date Input)
  - 「登録」ボタン

### 4.2 Timer
- **機能**: 作業時間をリアルタイムで計測する。
- **UI要素**:
  - 取り組むタスクの選択 (Dropdown: DOING/TODOのタスク)
  - サブタスク名入力 (Text: 「資料探し」など)
  - Start / Stop ボタン
  - 経過時間のリアルタイム表示
- **挙動**: Stop時に `durationSeconds` を計算し、DBへ保存する。

### 4.3 Task Overlay (Modal)
- **機能**: タスクリストをクリックした際に表示される詳細ポップアップ。
- **構成**:
  1. **TaskAnalytics**: 選択されたタスクの「時間負債」を表示。
     - (そのタスクの実績合計) - (見積もり) を計算。
  2. **GanttChart**: 選択されたタスクに関連する `timeLogs` のみをフィルタリングしてチャート表示。

### 4.4 GanttChart (Component)
- **機能**: 渡された `timeLogs` を時系列でバーとして描画する。
- **仕様**:
  - 横軸: 時間 (日付・時刻)
  - 縦軸: サブタスク または ログのセッション
  - Logの `startTime` から `endTime` までの区間をバーとして描画。

## 5. 技術スタック & 開発ルール

- **Core**: React, Vite
- **Styling**: Tailwind CSS (ユーティリティクラスを活用し、CSSファイル作成を減らす)
- **Backend**: Firebase Firestore
- **Coding Style**:
  - **Custom Hooks**: データの取得・保存ロジックは必ず `hooks/` ディレクトリに分離する。コンポーネント内に `uEffect` で直接 `onSnapshot` を書かない。
  - **段階的実装**: UI実装(固定値) → State実装(機能動作) → DB接続 の順で進める。
