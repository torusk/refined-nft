'use client';

import { useState } from 'react';
import { useTexts } from '@/hooks/useTexts';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ClaimPage() {
  const texts = useTexts();
  const [claimableAmount, setClaimableAmount] = useState(125.5);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimHistory] = useState([
    { date: '2024-01-15', amount: 50.0, txHash: '0x1234...abcd' },
    { date: '2024-01-10', amount: 75.25, txHash: '0x5678...efgh' },
    { date: '2024-01-05', amount: 100.0, txHash: '0x9abc...ijkl' },
  ]);

  const handleClaim = async () => {
    if (claimableAmount <= 0) return;
    
    setIsLoading(true);
    // モックの処理時間
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    setIsClaimed(true);
    setClaimableAmount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {texts.claim.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {texts.claim.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Token Info & Claim */}
          <div className="space-y-6">
            {/* Token Balance Card */}
            <Card>
              <CardHeader
                icon={
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              >
                $REFINED 残高
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {claimableAmount.toFixed(2)}
                  </div>
                  <div className="text-gray-600 mb-4">クレーム可能なトークン</div>
                  
                  {isClaimed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center text-green-800">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        クレーム完了！
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-600">今月の獲得</div>
                      <div className="font-semibold text-gray-900">45.5 REFINED</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-600">総獲得量</div>
                      <div className="font-semibold text-gray-900">1,250.75 REFINED</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleClaim}
                  disabled={claimableAmount <= 0 || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      クレーム中...
                    </div>
                  ) : claimableAmount <= 0 ? (
                    'クレーム可能なトークンがありません'
                  ) : (
                    `${claimableAmount.toFixed(2)} REFINED をクレーム`
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Token Info Card */}
            <Card>
              <CardHeader>$REFINED について</CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">コミュニティ参加報酬</div>
                      <div className="text-gray-600">イベント参加やクエスト完了で獲得</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">ガバナンストークン</div>
                      <div className="text-gray-600">コミュニティの意思決定に参加可能</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">ユーティリティ</div>
                      <div className="text-gray-600">特別なイベントやサービスで使用可能</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Claim History */}
          <Card>
            <CardHeader>クレーム履歴</CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimHistory.map((claim, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {claim.amount.toFixed(2)} REFINED
                        </div>
                        <div className="text-sm text-gray-600">{claim.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {claim.txHash}
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        詳細を見る
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {claimHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>まだクレーム履歴がありません</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="md" className="w-full">
                すべての履歴を見る
              </Button>
            </CardFooter>
          </Card>
        </div>


      </div>
    </div>
  );
}