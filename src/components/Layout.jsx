import React from 'react'

/**
 * 共通レイアウトコンポーネント
 * ヘッダーとメインコンテンツエリアを定義します。
 */
const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen md:h-screen bg-gray-50 text-gray-800 md:overflow-hidden">
            {/* ヘッダーエリア */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex-shrink-0">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">Refrecto (β)</h1>
                    <nav>
                        {/* 将来的にナビゲーションリンクなどをここに配置 */}
                        <span className="text-sm text-gray-500">Time Management App v0.0.1</span>
                    </nav>
                </div>
            </header>

            {/* メインコンテンツエリア: Desktopではスクロールしない (子がスクロールする) */}
            <main className="flex-1 container mx-auto p-4 md:p-8 md:overflow-hidden">
                {children}
            </main>

            {/* フッターエリア (必要であれば) */}
            <footer className="text-center p-4 text-gray-400 text-xs">
                &copy; 2026 v-tnta
            </footer>
        </div>
    )
}

export default Layout
