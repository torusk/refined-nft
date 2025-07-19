'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Challenge } from '@/types';

interface ResultFormProps {
  challenge: Challenge;
  onSubmit?: () => void;
}

export function ResultForm({ challenge, onSubmit }: ResultFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    isCompleted: true,
    actualTime: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    dnfReason: '',
    additionalNotes: '',
    evidenceFile: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Calculate total seconds from time input
  const getTotalSeconds = () => {
    const { hours, minutes, seconds } = formData.actualTime;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Format time for display
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get target time for comparison
  const getTargetTime = (): number | null => {
    if (challenge.goalType === 'completion') return null;
    return challenge.goalDetails?.targetTime || null;
  };

  // Check if goal is achieved
  const isGoalAchieved = (): boolean => {
    if (!formData.isCompleted) return false;
    
    const targetTime = getTargetTime();
    if (!targetTime) return true; // Completion goal is always achieved if completed
    
    const actualSeconds = getTotalSeconds();
    return actualSeconds <= targetTime;
  };

  const handleTimeChange = (field: 'hours' | 'minutes' | 'seconds', value: number) => {
    setFormData(prev => ({
      ...prev,
      actualTime: {
        ...prev.actualTime,
        [field]: Math.max(0, value),
      },
    }));
  };

  const handleCompletionChange = (completed: boolean) => {
    setFormData(prev => ({
      ...prev,
      isCompleted: completed,
      actualTime: completed ? prev.actualTime : { hours: 0, minutes: 0, seconds: 0 },
      dnfReason: completed ? '' : prev.dnfReason,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('ファイルサイズは10MB以下にしてください');
        return;
      }

      setFormData(prev => ({ ...prev, evidenceFile: file }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (formData.isCompleted) {
      const totalSeconds = getTotalSeconds();
      if (totalSeconds <= 0) {
        errors.push('完走時間を入力してください');
      }
    } else {
      if (!formData.dnfReason.trim()) {
        errors.push('未完走の理由を入力してください');
      }
    }

    if (!formData.evidenceFile) {
      errors.push('証拠画像をアップロードしてください');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsLoading(true);

    try {
      // First upload the image
      const formDataForUpload = new FormData();
      formDataForUpload.append('evidence', formData.evidenceFile!);
      formDataForUpload.append('challengeId', challenge.id);

      const uploadResponse = await fetch('/api/upload/evidence', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataForUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const { data: uploadData } = await uploadResponse.json();

      // Then submit the result
      const resultData = {
        challengeId: challenge.id,
        resultData: {
          isCompleted: formData.isCompleted,
          actualTime: formData.isCompleted ? getTotalSeconds() : null,
          dnfReason: formData.isCompleted ? null : formData.dnfReason,
          additionalNotes: formData.additionalNotes || null,
        },
        evidenceHash: uploadData.hash,
        evidenceUrl: uploadData.url,
      };

      const resultResponse = await fetch(`/api/challenges/${challenge.id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      });

      if (!resultResponse.ok) {
        const errorData = await resultResponse.json();
        throw new Error(errorData.error || '結果の提出に失敗しました');
      }

      // Success
      if (onSubmit) {
        onSubmit();
      } else {
        router.push(`/challenges/${challenge.id}`);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const targetTime = getTargetTime();
  const goalAchieved = isGoalAchieved();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">結果を記録</h2>
      
      {/* Challenge Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>開催日: {new Date(challenge.targetDate).toLocaleDateString('ja-JP')}</div>
          <div>
            目標: {challenge.goalType === 'completion' ? '完走' :
                   challenge.goalType === 'sub4' ? 'サブ4' :
                   challenge.goalType === 'sub3' ? 'サブ3' :
                   challenge.goalType === 'sub3_5' ? 'サブ3.5' :
                   'カスタム'}
            {targetTime && ` (${formatTime(targetTime)})`}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Completion Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            完走状況 *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="completion"
                checked={formData.isCompleted}
                onChange={() => handleCompletionChange(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">完走しました</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="completion"
                checked={!formData.isCompleted}
                onChange={() => handleCompletionChange(false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">途中棄権（DNF）</span>
            </label>
          </div>
        </div>

        {/* Time Input (if completed) */}
        {formData.isCompleted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              完走タイム *
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.actualTime.hours}
                  onChange={(e) => handleTimeChange('hours', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">時間</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.actualTime.minutes}
                  onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">分</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.actualTime.seconds}
                  onChange={(e) => handleTimeChange('seconds', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">秒</span>
              </div>
            </div>
            
            {/* Goal Achievement Status */}
            {getTotalSeconds() > 0 && (
              <div className={`mt-3 p-3 rounded-lg ${
                goalAchieved ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className={`text-sm font-medium ${
                  goalAchieved ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {goalAchieved ? '🎉 目標達成！' : '💪 完走おめでとう！'}
                </div>
                <div className={`text-sm ${
                  goalAchieved ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  記録: {formatTime(getTotalSeconds())}
                  {targetTime && ` (目標: ${formatTime(targetTime)})`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DNF Reason (if not completed) */}
        {!formData.isCompleted && (
          <div>
            <label htmlFor="dnfReason" className="block text-sm font-medium text-gray-700 mb-2">
              途中棄権の理由 *
            </label>
            <textarea
              id="dnfReason"
              value={formData.dnfReason}
              onChange={(e) => setFormData(prev => ({ ...prev, dnfReason: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="例: 膝の痛みのため30km地点で棄権"
            />
          </div>
        )}

        {/* Evidence Upload */}
        <div>
          <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-2">
            証拠画像 *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="証拠画像プレビュー"
                    className="mx-auto h-32 w-auto rounded-lg"
                  />
                </div>
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="evidence"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>画像をアップロード</span>
                  <input
                    id="evidence"
                    name="evidence"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">またはドラッグ&ドロップ</p>
              </div>
              <p className="text-xs text-gray-500">
                完走証、リザルト画面、公式記録など（PNG, JPG, 10MB以下）
              </p>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            追加メモ（任意）
          </label>
          <textarea
            id="notes"
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="レースの感想、コンディション、今後の目標など..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '提出中...' : '結果を提出'}
          </button>
        </div>
      </form>
    </div>
  );
}