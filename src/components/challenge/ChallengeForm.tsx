'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengeTemplate } from '@/types';
import { GoalSelector } from './GoalSelector';

interface ChallengeFormProps {
  template?: ChallengeTemplate;
}

export function ChallengeForm({ template }: ChallengeFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    targetDate: '',
    goalType: '',
    customTargetTime: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ChallengeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(template || null);

  useEffect(() => {
    if (!template) {
      fetchTemplates();
    }
  }, [template]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const { data } = await response.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]); // Default to first template
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalChange = (goalType: string, customTime?: number) => {
    setFormData(prev => ({
      ...prev,
      goalType,
      customTargetTime: customTime || 0,
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    setFormData(prev => ({
      ...prev,
      goalType: '',
      customTargetTime: 0,
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('大会名は必須です');
    }

    if (!formData.targetDate) {
      errors.push('開催日は必須です');
    } else {
      const targetDate = new Date(formData.targetDate);
      if (targetDate <= new Date()) {
        errors.push('開催日は未来の日付である必要があります');
      }
    }

    if (!formData.goalType) {
      errors.push('目標を選択してください');
    }

    if (formData.goalType === 'custom' && formData.customTargetTime <= 0) {
      errors.push('カスタム目標には有効な目標タイムが必要です');
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

    if (!selectedTemplate) {
      setError('テンプレートが選択されていません');
      return;
    }

    setIsLoading(true);

    try {
      const challengeData = {
        templateId: selectedTemplate.id,
        title: formData.title.trim(),
        targetDate: formData.targetDate,
        goalType: formData.goalType,
        goalDetails: formData.goalType === 'custom' 
          ? { targetTime: formData.customTargetTime }
          : {},
      };

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'チャレンジの作成に失敗しました');
      }

      const { data: challenge } = await response.json();
      
      // Redirect to challenge detail page
      router.push(`/challenges/${challenge.id}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">新しいチャレンジを作成</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection (if not pre-selected) */}
        {!template && templates.length > 0 && (
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              チャレンジタイプ
            </label>
            <select
              id="template"
              value={selectedTemplate?.id || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedTemplate.description}
              </p>
            )}
          </div>
        )}

        {/* Challenge Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            大会名 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="例: 東京マラソン2024"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Target Date */}
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
            開催日 *
          </label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleInputChange}
            min={getMinDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Goal Selection */}
        {selectedTemplate && (
          <GoalSelector
            template={selectedTemplate}
            selectedGoalType={formData.goalType}
            customTargetTime={formData.customTargetTime}
            onGoalChange={handleGoalChange}
          />
        )}

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
            disabled={isLoading || !selectedTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '作成中...' : 'チャレンジを作成'}
          </button>
        </div>
      </form>
    </div>
  );
}