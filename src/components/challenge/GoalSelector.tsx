'use client';

import { useState, useEffect } from 'react';
import { ChallengeTemplate, GoalType } from '@/types';

// Client-side utility functions
function timeToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * 3600 + minutes * 60 + seconds;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

interface GoalSelectorProps {
  template: ChallengeTemplate;
  selectedGoalType: string;
  customTargetTime?: number;
  onGoalChange: (goalType: string, customTime?: number) => void;
}

export function GoalSelector({
  template,
  selectedGoalType,
  customTargetTime,
  onGoalChange,
}: GoalSelectorProps) {
  const [customTime, setCustomTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (customTargetTime) {
      const hours = Math.floor(customTargetTime / 3600);
      const minutes = Math.floor((customTargetTime % 3600) / 60);
      const seconds = customTargetTime % 60;
      setCustomTime({ hours, minutes, seconds });
    }
  }, [customTargetTime]);

  const handleGoalTypeChange = (goalTypeId: string) => {
    onGoalChange(goalTypeId);
  };

  const handleCustomTimeChange = (field: 'hours' | 'minutes' | 'seconds', value: number) => {
    const newTime = { ...customTime, [field]: value };
    setCustomTime(newTime);
    
    const totalSeconds = timeToSeconds(newTime.hours, newTime.minutes, newTime.seconds);
    onGoalChange('custom', totalSeconds);
  };

  const getGoalDescription = (goalType: GoalType) => {
    if (goalType.targetValue) {
      return `${goalType.description} (${formatTime(goalType.targetValue)})`;
    }
    return goalType.description;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">目標を選択してください</h3>
      
      <div className="space-y-3">
        {template.goalTypes.map((goalType) => (
          <div key={goalType.id} className="relative">
            <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="goalType"
                value={goalType.id}
                checked={selectedGoalType === goalType.id}
                onChange={() => handleGoalTypeChange(goalType.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {goalType.name}
                </div>
                <div className="text-sm text-gray-500">
                  {getGoalDescription(goalType)}
                </div>
              </div>
            </label>

            {/* Custom time input */}
            {goalType.id === 'custom' && selectedGoalType === 'custom' && (
              <div className="mt-3 ml-7 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-3">
                  目標タイムを設定してください
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={customTime.hours}
                      onChange={(e) => handleCustomTimeChange('hours', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">時間</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customTime.minutes}
                      onChange={(e) => handleCustomTimeChange('minutes', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">分</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customTime.seconds}
                      onChange={(e) => handleCustomTimeChange('seconds', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">秒</span>
                  </div>
                </div>
                {customTargetTime && customTargetTime > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    目標タイム: {formatTime(customTargetTime)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedGoalType && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>選択された目標:</strong>{' '}
            {template.goalTypes.find(g => g.id === selectedGoalType)?.name}
            {selectedGoalType === 'custom' && customTargetTime && (
              <span> ({formatTime(customTargetTime)})</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}