'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ChallengeForm } from '@/components/challenge/ChallengeForm';

export default function NewChallengePage() {
  const { isAuthenticated, isLoading } = useAuth();

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
            チャレンジを作成するにはウォレットでログインしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新しいチャレンジ</h1>
          <p className="text-gray-600 mt-2">
            マラソン大会への参加を宣言し、目標を設定しましょう。
          </p>
        </div>

        <ChallengeForm />
      </div>
    </div>
  );
}