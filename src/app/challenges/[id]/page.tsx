'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge } from '@/types';

// Mock challenge data for preview
const mockChallenge = {
  id: 'mock-challenge-001',
  userId: 'mock-user-001',
  templateId: 'marathon-template-001',
  title: '東京マラソン2024',
  goalType: 'sub4',
  goalDetails: { targetTime: 14400 }, // 4 hours
  targetDate: new Date('2024-03-03'),
  status: 'declared' as const,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  template: {
    name: 'Marathon',
    description: 'フルマラソン（42.195km）チャレンジテンプレート',
  },
  result: null, // No result yet
  nft: null, // No NFT yet
};

const mockChallengeWithResult = {
  ...mockChallenge,
  id: 'mock-challenge-002',
  title: '大阪マラソン2023',
  targetDate: new Date('2023-11-26'),
  status: 'completed' as const,
  result: {
    data: {
      isCompleted: true,
      actualTime: 13500, // 3:45:00
      additionalNotes: '天候に恵まれ、目標を達成できました！',
    },
    evidenceUrl: '/uploads/mock-evidence.jpg',
    isAchieved: true,
    achievementLevel: 'gold' as const,
    submittedAt: new Date('2023-11-26'),
  },
  nft: {
    tokenId: 'NFT-001',
    imageUrl: '/uploads/mock-nft-gold.png',
  },
};

export default function ChallengeDetailPage() {
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show mock data immediately for preview
    setTimeout(() => {
      if (params.id === 'mock-with-result') {
        setChallenge(mockChallengeWithResult);
      } else {
        setChallenge(mockChallenge);
      }
      setLoading(false);
    }, 500);

    // If authenticated, try to fetch real data
    if (isAuthenticated && token && params.id !== 'mock-challenge' && params.id !== 'mock-with-result') {
      fetchChallenge();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setChallenge(data);
      } else if (response.status === 404) {
        setError('チャレンジが見つかりません');
      } else if (response.status === 403) {
        setError('このチャレンジにアクセスする権限がありません');
      } else {
        throw new Error('チャレンジの取得に失敗しました');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // Keep showing mock data on error
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getGoalText = (goalType: string, goalDetails: any) => {
    switch (goalType) {
      case 'completion':
        return '完走';
      case 'sub4':
        return 'サブ4 (4:00:00)';
      case 'sub3_5':
        return 'サブ3.5 (3:30:00)';
      case 'sub3':
        return 'サブ3 (3:00:00)';
      case 'custom':
        return `カスタム (${formatTime(goalDetails?.targetTime || 0)})`;
      default:
        return goalType;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      declared: { text: '宣言済み', color: 'bg-blue-100 text-blue-800' },
      in_progress: { text: '実行中', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: '完了', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'キャンセル', color: 'bg-gray-100 text-gray-800' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.declared;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getAchievementBadge = (level: string) => {
    const badges = {
      gold: { text: '🥇 目標達成', color: 'bg-yellow-100 text-yellow-800' },
      silver: { text: '🥈 完走', color: 'bg-gray-100 text-gray-800' },
      bronze: { text: '🥉 挑戦', color: 'bg-orange-100 text-orange-800' },
    };
    
    const badge = badges[level as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !challenge) {
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

  const isOverdue = new Date(challenge.targetDate) < new Date();
  const canSubmitResult = challenge.status === 'declared' && isOverdue && !challenge.result;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
            {getStatusBadge(challenge.status)}
          </div>
          <p className="text-gray-600">
            {challenge.template?.description || 'マラソンチャレンジの詳細'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">チャレンジ詳細</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">開催日:</span>
                  <span className="font-medium">
                    {new Date(challenge.targetDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">目標:</span>
                  <span className="font-medium">
                    {getGoalText(challenge.goalType, challenge.goalDetails)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">宣言日:</span>
                  <span className="font-medium">
                    {new Date(challenge.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {isOverdue && challenge.status === 'declared' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      📅 大会日を過ぎています。結果を記録してください。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Result Section */}
            {challenge.result ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">結果</h2>
                  {getAchievementBadge(challenge.result.achievementLevel)}
                </div>
                
                <div className="space-y-4">
                  {challenge.result.data.isCompleted ? (
                    <div>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatTime(challenge.result.data.actualTime)}
                      </div>
                      <p className="text-gray-600">完走タイム</p>
                      
                      {challenge.goalDetails?.targetTime && (
                        <div className="mt-3 text-sm text-gray-600">
                          目標: {formatTime(challenge.goalDetails.targetTime)}
                          <span className={`ml-2 ${
                            challenge.result.data.actualTime <= challenge.goalDetails.targetTime
                              ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            ({challenge.result.data.actualTime <= challenge.goalDetails.targetTime 
                              ? '達成' : '未達成'})
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-medium text-orange-600 mb-2">
                        途中棄権 (DNF)
                      </div>
                      {challenge.result.data.dnfReason && (
                        <p className="text-gray-600">
                          理由: {challenge.result.data.dnfReason}
                        </p>
                      )}
                    </div>
                  )}

                  {challenge.result.data.additionalNotes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>メモ:</strong> {challenge.result.data.additionalNotes}
                      </p>
                    </div>
                  )}

                  {challenge.result.evidenceUrl && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">証拠画像</h3>
                      <img
                        src={challenge.result.evidenceUrl}
                        alt="完走証拠"
                        className="max-w-full h-auto rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuiovOaYjueUu+WDjzwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    提出日: {new Date(challenge.result.submittedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>
            ) : canSubmitResult ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">結果を記録</h2>
                <p className="text-gray-600 mb-6">
                  マラソンの結果を記録して、NFTメダルを獲得しましょう。
                </p>
                <a
                  href={`/challenges/${challenge.id}/result`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  結果を記録する
                </a>
              </div>
            ) : challenge.status === 'declared' ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">大会まで</h2>
                <p className="text-gray-600">
                  大会終了後に結果を記録できます。頑張ってください！
                </p>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* NFT Card */}
            {challenge.nft ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">獲得NFT</h3>
                <div className="text-center">
                  <img
                    src={challenge.nft.imageUrl}
                    alt="NFTメダル"
                    className="w-32 h-32 mx-auto rounded-lg mb-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2MCIgZmlsbD0iI2ZmZDcwMCIgc3Ryb2tlPSIjZjU5ZTBiIiBzdHJva2Utd2lkdGg9IjgiLz48dGV4dCB4PSI2NCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfpYE8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <p className="text-sm text-gray-600">Token ID: {challenge.nft.tokenId}</p>
                </div>
              </div>
            ) : challenge.result ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">NFT発行中</h3>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">
                    NFTメダルを発行しています...
                  </p>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="space-y-3">
                {!isAuthenticated && (
                  <div className="text-sm text-gray-600 mb-3">
                    ※ ウォレット接続後に利用可能
                  </div>
                )}
                
                {challenge.status === 'declared' && !isOverdue && (
                  <button
                    disabled={!isAuthenticated}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    チャレンジを編集
                  </button>
                )}
                
                <button
                  disabled={!isAuthenticated}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                >
                  共有する
                </button>
                
                {challenge.status === 'declared' && !challenge.result && (
                  <button
                    disabled={!isAuthenticated}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    チャレンジを削除
                  </button>
                )}
              </div>
            </div>

            {/* Preview Notice */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      プレビューモード
                    </h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>これはサンプルデータです。実際の機能を使用するにはウォレットを接続してください。</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}