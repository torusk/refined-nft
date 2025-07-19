'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Marathon Challenge Protocol
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              マラソンの挑戦を宣言し、記録をNFTとして永続化
            </p>
            <p className="text-lg mb-12 opacity-80 max-w-3xl mx-auto">
              大会への参加を事前に宣言し、目標を設定。完走後は結果を記録して、
              達成度に応じたNFTメダルを獲得できます。
            </p>
            
            {!isAuthenticated ? (
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors block mx-auto"
                >
                  ウォレットで始める
                </button>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-3">または、まずはプレビューを確認</p>
                  <div className="space-x-4">
                    <a
                      href="/challenges/mock-challenge"
                      className="border border-white/50 text-white px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors inline-block"
                    >
                      宣言済みチャレンジ
                    </a>
                    <a
                      href="/challenges/mock-with-result"
                      className="border border-white/50 text-white px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors inline-block"
                    >
                      完了済みチャレンジ
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <a
                  href="/challenges/new"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                >
                  新しいチャレンジを作成
                </a>
                <a
                  href="/challenges"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
                >
                  チャレンジ一覧
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              プロトコルの流れ
            </h2>
            <p className="text-lg text-gray-600">
              4つのステップで挑戦を記録
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">宣言</h3>
              <p className="text-gray-600">
                参加する大会と目標を事前に宣言
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">実行</h3>
              <p className="text-gray-600">
                マラソン大会に参加して走る
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">結果</h3>
              <p className="text-gray-600">
                完走証をアップロードして記録を提出
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">確認</h3>
              <p className="text-gray-600">
                達成度に応じたNFTメダルを獲得
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Status */}
      {isAuthenticated && user && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ようこそ、{user.displayName || 'ランナー'}さん！
              </h2>
              <p className="text-gray-600 mb-6">
                あなたのマラソンチャレンジを管理しましょう。
              </p>
              <div className="flex space-x-4">
                <a
                  href="/challenges/new"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  新しいチャレンジを作成
                </a>
                <a
                  href="/profile"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  プロフィールを見る
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}