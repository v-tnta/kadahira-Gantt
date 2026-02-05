# Refrecto (β)

Refrectoは、「時間負債」を可視化し、日々の作業実績を振り返ることでメタ認知能力を向上させるためのタスク管理アプリケーションです。
予定していた時間と実際にかかった時間のズレを一目で把握し、積み上げ式のガントチャートで作業の密度を振り返ることができます。

## 🚀 主な機能

### ⏱ 高機能タイマー
- **リアルタイム計測**: 作業時間を秒単位で正確に計測します。
- **一時停止・再開**: 作業の中断や休憩に対応し、合計経過時間を保持します。
- **事後報告**: タイマーを回し忘れた場合でも、後から実績を入力可能です。

### 📝 タスク管理
- **ステータス管理**: TODO, DOING, DONE の状態遷移。
- **論理削除（アーカイブ）**: 完了したタスクを非表示にし、必要に応じて復元できます。
- **時間負債の可視化**: 見積もり時間と実績時間の差分（負債）を表示し、進捗状況を警告します。

### 📊 実績ガントチャート
- **積み上げ式表示**: 実際の作業ログを時系列順に隙間なく積み上げ、純粋な作業時間を可視化します。
- **自動スケーリング**: 作業時間が長くなっても、画面幅に合わせてチャート全体が収まるように自動縮小されます。

### 📱 レスポンシブデザイン
- **PC**: 2カラムレイアウトで、タイマーとタスクリストを同時に操作可能。
- **Mobile**: シンプルなシングルカラムレイアウト。

## 🛠 使用技術

### Frontend
- **React**: UIライブラリ
- **Vite**: 高速なビルドツール
- **Tailwind CSS (v4)**: ユーティリティファーストなスタイリング

### Backend
- **Firebase Firestore**: リアルタイムNoSQLデータベース

### Architecture
保守性と拡張性を高めるため、**レイヤードアーキテクチャ**を採用しています。
- **Presentation Layer** (`src/components`): UIの描画
- **Application Layer** (`src/hooks`): ユースケースの制御
- **Infrastructure Layer** (`src/services`): Firebaseとの通信
- **Domain Layer** (`src/domain`): ビジネスロジックとエンティティ

## ⚙️ 環境構築

### 1. 前提条件
- Node.js (v18以上推奨)
- npm

### 2. インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd kadahira-Gantt

# 依存関係のインストール
npm install
```

### 3. 環境変数の設定
ルートディレクトリに `.env` ファイルを作成し、Firebaseの設定を追加してください。

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

## 📂 ディレクトリ構成

```
src/
├── components/          # UIコンポーネント (TaskForm, TaskList, Timer etc.)
├── domain/              # ドメインエンティティ (Task, TimeLog)
├── hooks/               # カスタムフック (useTasks, useTimeLogs)
├── lib/                 # ライブラリ設定 (firebase.js)
├── services/            # 外部サービス通信 (taskService, timeLogService)
├── App.jsx              # メインアプリケーションコンポーネント
└── main.jsx             # エントリーポイント
```
