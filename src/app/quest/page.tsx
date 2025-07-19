'use client';

import { useState } from 'react';
import { useTexts } from '@/hooks/useTexts';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function QuestPage() {
  const texts = useTexts();
  const [keyword, setKeyword] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeywordSubmit = async () => {
    if (!keyword.trim()) return;
    
    setIsLoading(true);
    // モックの処理時間
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setCurrentStep(2);
  };

  const handleGenerateMetadata = async () => {
    setIsLoading(true);
    // モックの処理時間
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    setCurrentStep(3);
  };

  const handleUpdateNFT = async () => {
    setIsLoading(true);
    // モックの処理時間
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setCurrentStep(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {texts.quest.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {texts.quest.description}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600 max-w-md mx-auto">
            <span>合言葉入力</span>
            <span>認証確認</span>
            <span>トークン配布</span>
            <span>完了</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - NFT Preview */}
          <Card>
            <CardHeader>NFT プレビュー</CardHeader>
            <CardContent>
              <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">NFT 画像</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">名前:</span>
                  <span className="font-medium">Refined NFT #{keyword || '---'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">属性:</span>
                  <span className="font-medium">{keyword || '未設定'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ステータス:</span>
                  <span className={`font-medium ${currentStep === 4 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentStep === 4 ? '更新完了' : '更新待ち'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Quest Steps */}
          <Card>
            <CardHeader>
              {currentStep === 1 && 'ステップ 1: 合言葉入力'}
              {currentStep === 2 && 'ステップ 2: 認証確認'}
              {currentStep === 3 && 'ステップ 3: トークン配布'}
              {currentStep === 4 && '完了！'}
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    管理者が設定した合言葉を入力してください。
                    正しい合言葉を入力すると $REFINED トークンを獲得できます。
                  </p>
                  <Input
                    label="合言葉"
                    placeholder="合言葉を入力してください"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="uppercase"
                  />
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">報酬:</h4>
                    <p className="text-sm text-blue-800">正解時: 50 REFINED トークン</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    入力された合言葉「{keyword}」を認証しています。
                    正しい合言葉の場合、トークン配布の準備を行います。
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">認証成功！</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• 合言葉: {keyword}</li>
                      <li>• 報酬: 50 REFINED トークン</li>
                      <li>• 認証日時の記録</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    認証が完了しました。
                    50 REFINED トークンをあなたのウォレットに配布します。
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">配布内容:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• 報酬: 50 REFINED トークン</li>
                      <li>• 合言葉: {keyword}</li>
                      <li>• 配布日時の記録</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      クエスト完了！
                    </h3>
                    <p className="text-green-700">
                      50 REFINED トークンが正常に配布されました。
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {currentStep === 1 && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleKeywordSubmit}
                  disabled={!keyword.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      送信中...
                    </div>
                  ) : (
                    '合言葉を送信'
                  )}
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerateMetadata}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      生成中...
                    </div>
                  ) : (
                    '認証を確認'
                  )}
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleUpdateNFT}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      更新中...
                    </div>
                  ) : (
                    'トークンを配布'
                  )}
                </Button>
              )}

              {currentStep === 4 && (
                <div className="w-full space-y-3">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => {
                      setCurrentStep(1);
                      setKeyword('');
                    }}
                    className="w-full"
                  >
                    新しいクエストを開始
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    ホームに戻る
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}