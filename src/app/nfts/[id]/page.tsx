'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NFTRecord } from '@/types';

export default function NFTDetailPage() {
  const params = useParams();
  const { isAuthenticated, token } = useAuth();
  const [nft, setNft] = useState<NFTRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock NFT data for preview
  const mockNFT: NFTRecord = {
    id: params.id as string,
    challengeId: 'mock-challenge-1',
    tokenId: 'MCP-001',
    contractAddress: '0x0000000000000000000000000000000000000000',
    metadata: {
      name: '🥇 東京マラソン2024 - Goal Achieved',
      description: 'Marathon Challenge Protocol NFT\n\nEvent: 東京マラソン2024\nDate: March 3, 2024\nGoal: Sub 4:00:00\nResult: 3:45:00\nAchievement: Goal Achieved\n\nThis NFT represents a marathon challenge completed through the Marathon Challenge Protocol - a system for declaring goals, recording results, and celebrating achievements.',
      image: `/api/nft/image/mock-challenge-1?level=gold&title=東京マラソン2024`,
      attributes: {
        challenge_type: 'Marathon',
        event: '東京マラソン2024',
        goal_type: 'SUB4',
        achievement_level: 'GOLD',
        year: 2024,
        month: 'March',
        completion_status: 'Completed',
        goal_achievement: 'Achieved',
        finish_time_hours: 3.75,
        time_category: 'Intermediate (Sub 4:00)',
      },
    },
    imageUrl: `/api/nft/image/mock-challenge-1?level=gold&title=東京マラソン2024`,
    mintedAt: new Date('2024-03-03'),
  };

  useEffect(() => {
    if (!isAuthenticated) {
      // Show mock data for preview
      setTimeout(() => {
        setNft(mockNFT);
        setLoading(false);
      }, 500);
    } else if (token) {
      fetchNFT();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchNFT = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nfts/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setNft(data);
      } else if (response.status === 404) {
        setError('NFTが見つかりません');
      } else {
        throw new Error('NFTの取得に失敗しました');
      }
    } catch (err: any) {
      setError(err.message);
      // Fallback to mock data on error
      setNft(mockNFT);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const shareNFT = () => {
    if (navigator.share) {
      navigator.share({
        title: nft?.metadata.name,
        text: `Check out my Marathon Challenge NFT: ${nft?.metadata.name}`,
        url: window.location.href,
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const getAchievementColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      case 'bronze':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAttributeKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  if (error && !nft) {
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
            href="/nfts"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            NFTコレクションに戻る
          </a>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            NFTが見つかりません
          </h1>
          <a
            href="/nfts"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            NFTコレクションに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-gray-700">ホーム</a></li>
            <li>/</li>
            <li><a href="/nfts" className="hover:text-gray-700">NFTコレクション</a></li>
            <li>/</li>
            <li className="text-gray-900">{nft.metadata.attributes.event}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 mb-6">
              <img
                src={nft.imageUrl}
                alt={nft.metadata.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5GVOeUu+WDjzwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={shareNFT}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                共有
              </button>
              <a
                href={`/challenges/${nft.challengeId}`}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                チャレンジ詳細
              </a>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{nft.metadata.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAchievementColor(nft.metadata.attributes.achievement_level)}`}>
                  {nft.metadata.attributes.achievement_level === 'GOLD' ? '🥇 ゴールド' :
                   nft.metadata.attributes.achievement_level === 'SILVER' ? '🥈 シルバー' :
                   '🥉 ブロンズ'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token ID:</span>
                  <span className="font-mono text-gray-900">{nft.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <button
                    onClick={() => copyToClipboard(nft.contractAddress)}
                    className="font-mono text-blue-600 hover:text-blue-800 text-xs"
                    title="クリックでコピー"
                  >
                    {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">発行日:</span>
                  <span className="text-gray-900">
                    {new Date(nft.mintedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">説明</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {nft.metadata.description}
              </p>
            </div>

            {/* Attributes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">属性</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(nft.metadata.attributes).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      {formatAttributeKey(key)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ブロックチェーン情報</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ネットワーク:</span>
                  <span className="text-gray-900">Ethereum</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">トークン規格:</span>
                  <span className="text-gray-900">ERC-721</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">コントラクト:</span>
                  <button
                    onClick={() => copyToClipboard(nft.contractAddress)}
                    className="font-mono text-blue-600 hover:text-blue-800 flex items-center"
                    title="クリックでコピー"
                  >
                    {nft.contractAddress.slice(0, 10)}...{nft.contractAddress.slice(-8)}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Notice */}
        {!isAuthenticated && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                  <p>これはサンプルNFTです。実際のNFTを獲得するにはウォレットを接続してマラソンチャレンジを完了してください。</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}