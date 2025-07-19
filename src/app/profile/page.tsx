'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { UserStats } from '@/components/profile/UserStats';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h1>
          <p className="text-gray-600 mb-6">
            プロフィールを表示するにはウォレットでログインしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">
            あなたの情報と統計を管理できます。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <div>
            <ProfileForm />
          </div>

          {/* User Stats */}
          <div>
            <UserStats />
          </div>
        </div>

        {/* User Info Display */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">アカウント情報</h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">表示名:</span>
              <span className="ml-2 text-gray-900">
                {user?.displayName || '未設定'}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">ウォレットアドレス:</span>
              <span className="ml-2 text-gray-900 font-mono text-sm">
                {user?.walletAddress}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">登録日:</span>
              <span className="ml-2 text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}
              </span>
            </div>
            
            {user?.bio && (
              <div>
                <span className="text-sm font-medium text-gray-700">自己紹介:</span>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}