'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NFTRecord } from '@/types';

export default function NFTCollectionPage() {
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [nfts, setNfts] = useState<NFTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Mock NFT data for preview
  const mockNFTs: NFTRecord[] = [
    {
      id: 'mock-nft-1',
      challengeId: 'mock-challenge-1',
      tokenId: 'MCP-001',
      contractAddress: '0x0000000000000000000000000000000000000000',
      metadata: {
        name: '🥇 東京マラソン2024 - Goal Achieved',
        description: 'Marathon Challenge Protocol NFT\n\nEvent: 東京マラソン2024\nDate: March 3, 2024\nGoal: Sub 4:00:00\nResult: 3:45:00\nAchievement: Goal Achieved',
        image: '/api/nft/image/mock-challenge-1?level=gold&title=東京マラソン2024',
        attributes: {
          challenge_type: 'Marathon',
          event: '東京マラソン2024',
          goal_type: 'SUB4',
          achievement_level: 'GOLD',
          year: 2024,
          completion_status: 'Completed',
          goal_achievement: 'Achieved',
        },
      },
      imageUrl: '/api/nft/image/mock-challenge-1?level=gold&title=東京マラソン2024',
      mintedAt: new Date('2024-03-03'),
    },
    {
      id: 'mock-nft-2',
      challengeId: 'mock-challenge-2',
      tokenId: 'MCP-002',
      contractAddress: '0x0000000000000000000000000000000000000000',
      metadata: {
        name: '🥈 大阪マラソン2023 - Marathon Completed',
        description: 'Marathon Challenge Protocol NFT\n\nEvent: 大阪マラソン2023\nDate: November 26, 2023\nGoal: Sub 4:00:00\nResult: 4:15:30\nAchievement: Marathon Completed',
        image: '/api/nft/image/mock-challenge-2?level=silver&title=大阪マラソン2023',
        attributes: {
          challenge_type: 'Marathon',
          event: '大阪マラソン2023',
          goal_type: 'SUB4',
          achievement_level: 'SILVER',
          year: 2023,
          completion_status: 'Completed',
        },
      },
      imageUrl: '/api/nft/image/mock-challenge-2?level=silver&title=大阪マラソン2023',
      mintedAt: new Date('2023-11-26'),
    },
    {
      id: 'mock-nft-3',
      challengeId: 'mock-challenge-3',
      tokenId: 'MCP-003',
      contractAddress: '0x0000000000000000000000000000000000000000',
      metadata: {
        name: '🥉 京都マラソン2023 - Marathon Challenged',
        description: 'Marathon Challenge Protocol NFT\n\nEvent: 京都マラソン2023\nDate: February 19, 2023\nGoal: Sub 3:30:00\nStatus: Did Not Finish (DNF)\nAchievement: Marathon Challenged',
        image: '/api/nft/image/mock-challenge-3?level=bronze&title=京都マラソン2023',
        attributes: {
          challenge_type: 'Marathon',
          event: '京都マラソン2023',
          goal_type: 'SUB3_5',
          achievement_level: 'BRONZE',
          year: 2023,
          completion_status: 'DNF',
        },
      },
      imageUrl: '/api/nft/image/mock-challenge-3?level=bronze&title=京都マラソン2023',
      mintedAt: new Date('2023-02-19'),
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      // Show mock data for preview
      setTimeout(() => {
        setNfts(mockNFTs);
        setLoading(false);
      }, 500);
    } else if (token) {
      fetchNFTs();
    }
  }, [isAuthenticated, token]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nfts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setNfts(data);
      } else {
        throw new Error('Failed to fetch NFTs');
      }
    } catch (err: any) {
      setError(err.message);
      // Fallback to mock data on error
      setNfts(mockNFTs);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNFTs = () => {
    if (filter === 'all') return nfts;
    return nfts.filter(nft => nft.metadata.attributes.achievement_level.toLowerCase() === filter);
  };

  const getAchievementStats = () => {
    const stats = {
      gold: nfts.filter(nft => nft.metadata.attributes.achievement_level === 'GOLD').length,
      silver: nfts.filter(nft => nft.metadata.attributes.achievement_level === 'SILVER').length,
      bronze: nfts.filter(nft => nft.metadata.attributes.achievement_level === 'BRONZE').length,
    };
    return stats;
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

  const filteredNFTs = getFilteredNFTs();
  const stats = getAchievementStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NFTコレクション</h1>
          <p className="text-gray-600 mt-2">
            {isAuthenticated 
              ? 'あなたが獲得したマラソンチャレンジNFTメダルのコレクションです。'
              : 'マラソンチャレンジNFTメダルのサンプルコレクションです。'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">総NFT数</p>
                <p className="text-2xl font-bold text-gray-900">{nfts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-2xl">🥇</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">ゴールドメダル</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.gold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-2xl">🥈</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">シルバーメダル</p>
                <p className="text-2xl font-bold text-gray-600">{stats.silver}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-2xl">🥉</div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">ブロンズメダル</p>
                <p className="text-2xl font-bold text-orange-600">{stats.bronze}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">フィルター:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'すべて', count: nfts.length },
                { key: 'gold', label: '🥇 ゴールド', count: stats.gold },
                { key: 'silver', label: '🥈 シルバー', count: stats.silver },
                { key: 'bronze', label: '🥉 ブロンズ', count: stats.bronze },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        {filteredNFTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              NFTがありません
            </h3>
            <p className="text-gray-600 mb-6">
              マラソンチャレンジを完了してNFTメダルを獲得しましょう。
            </p>
            <a
              href="/challenges/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              チャレンジを作成
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.map((nft) => (
              <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                  <img
                    src={nft.imageUrl}
                    alt={nft.metadata.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5GVOeUu+WDjzwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {nft.metadata.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div>イベント: {nft.metadata.attributes.event}</div>
                    <div>年: {nft.metadata.attributes.year}</div>
                    <div>Token ID: {nft.tokenId}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      nft.metadata.attributes.achievement_level === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      nft.metadata.attributes.achievement_level === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {nft.metadata.attributes.achievement_level === 'GOLD' ? '🥇 ゴールド' :
                       nft.metadata.attributes.achievement_level === 'SILVER' ? '🥈 シルバー' :
                       '🥉 ブロンズ'}
                    </span>
                    <a
                      href={`/nfts/${nft.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細 →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Notice */}
        {!isAuthenticated && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                プレビューモード
              </h3>
              <p className="text-blue-700 mb-4">
                これはサンプルNFTです。実際のNFTを獲得するにはウォレットを接続してマラソンチャレンジを完了してください。
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ウォレットを接続
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}