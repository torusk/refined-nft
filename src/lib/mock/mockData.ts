// Mock data for development without database
import { ChallengeTemplate, GoalType } from '@/types';

export const mockMarathonTemplate: ChallengeTemplate = {
  id: 'marathon-template-001',
  name: 'Marathon',
  description: 'フルマラソン（42.195km）チャレンジテンプレート',
  goalTypes: [
    {
      id: 'completion',
      name: '完走',
      description: 'とにかく完走することが目標',
    },
    {
      id: 'sub4',
      name: 'サブ4',
      description: '4時間以内での完走',
      targetValue: 14400, // 4 hours in seconds
    },
    {
      id: 'sub3_5',
      name: 'サブ3.5',
      description: '3時間30分以内での完走',
      targetValue: 12600, // 3.5 hours in seconds
    },
    {
      id: 'sub3',
      name: 'サブ3',
      description: '3時間以内での完走',
      targetValue: 10800, // 3 hours in seconds
    },
    {
      id: 'custom',
      name: 'カスタム',
      description: '自分で設定した目標タイム',
    },
  ],
  validationRules: [
    {
      field: 'title',
      rule: 'required',
      message: '大会名は必須です',
    },
    {
      field: 'targetDate',
      rule: 'future',
      message: '開催日は未来の日付である必要があります',
    },
  ],
  isActive: true,
  createdAt: new Date(),
};

export const mockTemplates: ChallengeTemplate[] = [mockMarathonTemplate];

// Mock user for development
export const mockUser = {
  id: 'mock-user-001',
  walletAddress: '0x1234567890123456789012345678901234567890',
  displayName: 'テストランナー',
  bio: 'マラソンが大好きです！',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock challenges
export const mockChallenges = [
  {
    id: 'challenge-001',
    userId: 'mock-user-001',
    templateId: 'marathon-template-001',
    title: '東京マラソン2024',
    goalType: 'sub4',
    goalDetails: { targetTime: 14400 },
    targetDate: new Date('2024-03-03'),
    status: 'declared' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'challenge-002',
    userId: 'mock-user-001',
    templateId: 'marathon-template-001',
    title: '大阪マラソン2024',
    goalType: 'completion',
    goalDetails: {},
    targetDate: new Date('2024-02-25'),
    status: 'declared' as const,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export const mockStats = {
  totalChallenges: 5,
  completedChallenges: 3,
  achievedGoals: 2,
  averageTime: 13500, // 3:45:00
  bestTime: 12600, // 3:30:00
};