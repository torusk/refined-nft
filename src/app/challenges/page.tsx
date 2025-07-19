'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge } from '@/types';

export default function ChallengesPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchChallenges();
    }
  }, [isAuthenticated, token]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setChallenges(data);
      } else {
        throw new Error('Failed to fetch challenges');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h1>
          <p className="text-gray-600 mb-6">
            チャレンジを表示するにはウォレットでログインしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">チャレンジ一覧</h1>
            <p className="text-gray-600 mt-2">
              あなたのマラソンチャレンジを管理できます。
            </p>
          </div>
          <a
            href="/challenges/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新しいチャレンジを作成
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">チャレンジを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchChallenges}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              再試行
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              チャレンジがありません
            </h3>
            <p className="text-gray-600 mb-6">
              最初のマラソンチャレンジを作成してみましょう。
            </p>
            <a
              href="/challenges/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              チャレンジを作成
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    challenge.status === 'declared' ? 'bg-blue-100 text-blue-800' :
                    challenge.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {challenge.status === 'declared' ? '宣言済み' :
                     challenge.status === 'completed' ? '完了' : challenge.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">開催日:</span>{' '}
                    {new Date(challenge.targetDate).toLocaleDateString('ja-JP')}
                  </div>
                  <div>
                    <span className="font-medium">目標:</span>{' '}
                    {challenge.goalType === 'completion' ? '完走' :
                     challenge.goalType === 'sub4' ? 'サブ4' :
                     challenge.goalType === 'sub3' ? 'サブ3' :
                     challenge.goalType === 'sub3_5' ? 'サブ3.5' :
                     'カスタム'}
                  </div>
                  <div>
                    <span className="font-medium">作成日:</span>{' '}
                    {new Date(challenge.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href={`/challenges/${challenge.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}