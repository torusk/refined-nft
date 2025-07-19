'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserStats as UserStatsType } from '@/types';
import { formatTime } from '@/lib/database/connection';

export function UserStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const { data } = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>統計情報の読み込みに失敗しました</p>
          <button
            onClick={fetchStats}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const completionRate = stats.totalChallenges > 0 
    ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100)
    : 0;

  const achievementRate = stats.completedChallenges > 0
    ? Math.round((stats.achievedGoals / stats.completedChallenges) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">統計情報</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {stats.totalChallenges}
          </div>
          <div className="text-sm text-gray-600">総挑戦回数</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {stats.completedChallenges}
          </div>
          <div className="text-sm text-gray-600">完走回数</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {stats.achievedGoals}
          </div>
          <div className="text-sm text-gray-600">目標達成回数</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {completionRate}%
          </div>
          <div className="text-sm text-gray-600">完走率</div>
        </div>
      </div>

      {stats.averageTime && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {formatTime(stats.averageTime)}
              </div>
              <div className="text-sm text-gray-600">平均タイム</div>
            </div>

            {stats.bestTime && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {formatTime(stats.bestTime)}
                </div>
                <div className="text-sm text-gray-600">ベストタイム</div>
              </div>
            )}
          </div>
        </div>
      )}

      {stats.completedChallenges > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {achievementRate}%
            </div>
            <div className="text-sm text-gray-600">目標達成率</div>
          </div>
        </div>
      )}
    </div>
  );
}