'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge } from '@/types';
import { ResultForm } from '@/components/challenge/ResultForm';

export default function ResultPage() {
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token && params.id) {
      fetchChallenge();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challenges/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setChallenge(data);
        
        // Check if result already exists
        if (data.result) {
          setError('この チャレンジの結果は既に提出済みです');
        }
      } else if (response.status === 404) {
        setError('チャレンジが見つかりません');
      } else if (response.status === 403) {
        setError('このチャレンジにアクセスする権限がありません');
      } else {
        throw new Error('チャレンジの取得に失敗しました');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
            結果を記録するにはウォレットでログインしてください。
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/challenges"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            チャレンジ一覧に戻る
          </a>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            チャレンジが見つかりません
          </h1>
          <a
            href="/challenges"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            チャレンジ一覧に戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">結果記録</h1>
          <p className="text-gray-600 mt-2">
            マラソンの結果を記録して、NFTメダルを獲得しましょう。
          </p>
        </div>

        <ResultForm challenge={challenge} />
      </div>
    </div>
  );
}