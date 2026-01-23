# Refrecto (β) System Design Document

## 1. 概要
本アプリケーションは、学生の時間管理能力とメタ認知を向上させるためのツールです。
「見積もり」と「実績」の差分（時間負債）を可視化し、タイマーログから「実績ガントチャート」を自動生成します。

## 1.1 UIレイアウト構成
- **Mobile (< 768px)**: 縦一列のシングルカラム配置。画面全体（Body）がスクロールする。
- **Desktop (>= 768px)**: 画面全体はスクロール不可（`h-screen` Fixed）。
  - **左カラム**: Timer, TaskForm (内部スクロール)
  - **右カラム**: TaskList (内部スクロール)


## 2. ファイル構造 (ディレクトリ構成)

```
src/
├── components/
│   ├── Layout.jsx         # ヘッダー・メインエリアを含む共通レイアウト
│   ├── TaskForm.jsx       # タスク登録・見積もり・締切入力
│   ├── TaskList.jsx       # タスク一覧・ステータス変更
│   ├── Timer.jsx          # アクティブタスクの計測・サブタスク入力
│   ├── TaskOverlay.jsx    # タスク詳細モーダル (Dashboard & Ganttを含む)
│   ├── TaskAnalytics.jsx  # 時間負債の計算と表示
│   └── GanttChart.jsx     # タイマーログに基づく実績ガントチャート表示 (Overlay内で使用)
├── hooks/                 ## hook: UseStateやUseEffectのようなノリで、カスタムされたオリジナルのフローをコードにしたもの
│   ├── useTasks.js        # Firestore: tasksコレクションのCRUD
│   └── useTimeLogs.js     # Firestore: timeLogsコレクションのCRUD (## CRUD: Create, Read, Update, Deleteの四種類の機能)
├── lib/
│   └── firebase.js        # Firebase初期化設定
├── App.jsx                # メイン画面の構成 (Timer, TaskForm, TaskList, Overlayの配置)
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
| `isVisible` | boolean | 表示フラグ (default: true) |
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
  - Start / Stop ボタン , きろくボタン
  - Startボタンを押すと、Stopボタンにかわり、タイマーが開始、または再開される。
  - Stopボタンを押すと、Startボタンに変わり、右にきろくボタンが表示される。タイマーは一時停止する。
  - きろくボタンを押すと、その時点での秒数で`durationSeconds`を計算してDBへ保存する。**この時、タスクのステータスが 'TODO' であれば自動的に 'DOING' に更新する。** また、タイマーをリセットする。
  - 経過時間のリアルタイム表示（ブラウザのスリープ等によるズレを防ぐため、1秒ごとに「現在時刻 - 開始時刻」を再計算して表示する）


  ### 4.2.1 Timer (事後報告) 
  - **補足**: 4.2 Timerの表示領域の右上に配置したボタンを押すと、作業の事後報告用モーダルを表示する。
  - **機能**: 作業時間を事後報告する。
  - **UI要素**:
    - 取り組んだタスクの選択 (Dropdown: DOING/TODOのタスク)
    - サブタスク名入力 (Text: 「資料探し」など)
    - 経過時間入力 (Number)
    - 「報告」ボタン
  - **挙動**: 「報告」ボタンを押すと、DBへ保存する。

### 4.3 タスク一覧 (TaskList)
タスク一覧を表示し、各タスクに対して直接操作を行えるコンポーネント。

- **機能**: 
  - タスク一覧の表示（**非表示タスクの表示切り替え機能付き**）
  - 個別タスクへのクイックアクション（完了・非表示）
  - 時間負債の視覚化

- **UI要素**:
  - **ヘッダーエリア**:
    - タイトル「タスク一覧」
    - **非表示タスク表示トグル**: 「非表示も表示」チェックボックス。ONにすると、論理削除されたタスクもグレーアウト状態で表示される。
  - **タスクカード**:
    - **時間負債表示**: ステータスが 'DOING' のタスクについて、時間負債（実績合計 - 見積もり）を分単位で表示する。
    - **完了ボタン**: ステータスが 'DONE' でないタスクに表示。
    - **非表示ボタン**: ステータスが 'DONE' のタスクに表示。
    - **(非表示)ラベル**: 論理削除されたタスクのタイトル横に赤字で表示。
    - ステータスバッジ

### 4.3.1 Task Overlay (Modal)
タスク詳細を表示し、編集・ステータス管理・削除を行うモーダル。

- **機能**: タスクの詳細表示と各種操作。

- **構成**:
  1. (省略: TaskAnalytics, GanttChart, 編集機能)
  2. **アクションボタン**:
     - **完了ボタン**: ステータスが 'DONE' でない場合に表示。
     - **非表示ボタン**: ステータスが 'DONE' かつ `isVisible: true` の場合に表示。非表示を実行すると**自動的にモーダルを閉じる**。
     - **再表示ボタン**: 非表示タスクを表示中に選択した場合に表示。リストに復帰(Restore)させる。
     - **物理削除ボタン**: 完全削除（Cascade Delete）。

### 4.3.2 GanttChart (Component)
- **機能**: 渡された `timeLogs` を「積み上げ式」のバーチャートとして描画する。
- **仕様**:
  - **表示形式**: 横スクロール可能な水平スタックバーチャート。
  - **横軸**: 経過時間 (開始0分から、30分ごとの目盛りを表示)。
  - **コンテンツ**: 各ログ（サブタスク）を、所要時間(duration)に応じた幅で、左から詰めて配置する（隙間時間を作らない）。
  - **見た目**: 
    - 「タスク名」のレーンに対し、作業ログが隙間なく連結された一本のバーのように見える。
    - バー内には「サブタスク名」を表示する。
  - **レスポンシブ挙動**:
    - 表示領域(コンテナ幅)よりもチャートが長くなる場合、自動的に縮小して領域内に収まるようにスケーリングする(最小スケール適用)。
    - 領域に余裕がある場合は、標準スケール(3px/分)で描画する。

## 5. 技術スタック & 開発ルール

- **Core**: React, Vite
- **Styling**: Tailwind CSS (ユーティリティクラスを活用し、CSSファイル作成を減らす)
- **Backend**: Firebase Firestore
- **Coding Style**:
  - **Custom Hooks**: データの取得・保存ロジックは必ず `hooks/` ディレクトリに分離する。コンポーネント内に `useEffect` で直接 `onSnapshot` を書かない。
  - **段階的実装**: UI実装(固定値) → State実装(機能動作) → DB接続 の順で進める。
