'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge, UserStats as UserStatsType } from '@/types';
import { UserStats } from '@/components/profile/UserStats';

interface RecentChallenge extends Challenge {
  result?: {
    isAchieved: boolean;
    achievementLevel: string;
    submittedAt: Date;
  };
}

export function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const [recentChallenges, setRecentChallenges] = useState<RecentChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for preview
  const mockRecentChallenges: RecentChallenge[] = [
    {
      id: 'mock-recent-1',
      userId: 'mock-user',
      templateId: 'marathon-template-001',
      title: '東京マラソン2024',
      goalType: 'sub4',
      goalDetails: { targetTime: 14400 },
      targetDate: new Date('2024-03-03'),
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-03'),
      result: {
        isAchieved: true,
        achievementLevel: 'gold',
        submittedAt: new Date('2024-03-03'),
      },
    },
    {
      id: 'mock-recent-2',
      userId: 'mock-user',
      templateId: 'marathon-template-001',
      title: '大阪マラソン2023',
      goalType: 'completion',
      goalDetails: {},
      targetDate: new Date('2023-11-26'),
      status: 'completed',
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-11-26'),
      result: {
        isAchieved: true,
        achievementLevel: 'gold',
        submittedAt: new Date('2023-11-26'),
      },
    },
    {
      id: 'mock-recent-3',
      userId: 'mock-user',
      templateId: 'marathon-template-001',
      title: '神戸マラソン2024',
      goalType: 'sub3_5',
      goalDetails: { targetTime: 12600 },
      targetDate: new Date('2024-11-17'),
      status: 'declared',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      // Show mock data for preview
      setTimeout(() => {
        setRecentChallenges(mockRecentChallenges);
        setLoading(false);
      }, 500);
    } else if (token) {
      fetchRecentChallenges();
    }
  }, [isAuthenticated, token]);

  const fetchRecentChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setRecentChallenges(data.slice(0, 5)); // Show only recent 5
      } else {
        throw new Error('Failed to fetch challenges');
      }
    } catch (err: any) {
      setError(err.message);
      // Fallback to mock data on error
      setRecentChallenges(mockRecentChallenges);
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
      gold: { text: '🥇', color: 'text-yellow-600' },
      silver: { text: '🥈', color: 'text-gray-600' },
      bronze: { text: '🥉', color: 'text-orange-600' },
    };
    
    const badge = badges[level as keyof typeof badges];
    return badge ? <span className={badge.color}>{badge.text}</span> : null;
  };

  const getUpcomingChallenges = () => {
    return recentChallenges.filter(challenge => 
      challenge.status === 'declared' && new Date(challenge.targetDate) > new Date()
    );
  };

  const getCompletedChallenges = () => {
    return recentChallenges.filter(challenge => challenge.status === 'completed');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingChallenges = getUpcomingChallenges();
  const completedChallenges = getCompletedChallenges();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          おかえりなさい、{user?.displayName || 'ランナー'}さん！
        </h1>
        <p className="opacity-90">
          あなたのマラソンチャレンジの進捗を確認しましょう。
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">総チャレンジ数</p>
              <p className="text-2xl font-bold text-gray-900">{recentChallenges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">完了済み</p>
              <p className="text-2xl font-bold text-gray-900">{completedChallenges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">予定中</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingChallenges.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">最近のチャレンジ</h2>
              <a
                href="/challenges"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                すべて見る →
              </a>
            </div>

            {recentChallenges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  チャレンジがありません
                </h3>
                <p className="text-gray-600 mb-4">
                  最初のマラソンチャレンジを作成してみましょう。
                </p>
                <a
                  href="/challenges/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  チャレンジを作成
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {recentChallenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                      <div className="flex items-center space-x-2">
                        {challenge.result && getAchievementBadge(challenge.result.achievementLevel)}
                        {getStatusBadge(challenge.status)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        開催日: {new Date(challenge.targetDate).toLocaleDateString('ja-JP')}
                      </div>
                      <div>
                        目標: {challenge.goalType === 'completion' ? '完走' :
                               challenge.goalType === 'sub4' ? 'サブ4' :
                               challenge.goalType === 'sub3' ? 'サブ3' :
                               challenge.goalType === 'sub3_5' ? 'サブ3.5' :
                               'カスタム'}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
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

        {/* Stats Sidebar */}
        <div>
          <UserStats />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/challenges/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">新しいチャレンジ</p>
              <p className="text-sm text-gray-600">大会を宣言する</p>
            </div>
          </a>

          <a
            href="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">プロフィール</p>
              <p className="text-sm text-gray-600">設定を編集</p>
            </div>
          </a>

          <a
            href="/nfts"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">NFTコレクション</p>
              <p className="text-sm text-gray-600">メダルを確認</p>
            </div>
          </a>
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
  );
}