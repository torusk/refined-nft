// Marathon Challenge Protocol - Type Definitions

export interface User {
  id: string;                    // UUID
  walletAddress: string;         // ウォレットアドレス（一意）
  displayName?: string;          // 表示名
  bio?: string;                  // 自己紹介
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeTemplate {
  id: string;                    // UUID
  name: string;                  // テンプレート名（例: "Marathon"）
  description: string;           // 説明
  goalTypes: GoalType[];         // 利用可能な目標タイプ
  validationRules: ValidationRule[]; // 検証ルール
  isActive: boolean;             // 有効フラグ
  createdAt: Date;
}

export interface GoalType {
  id: string;                    // 例: "completion", "sub4", "sub3"
  name: string;                  // 表示名
  description: string;
  targetValue?: number;          // 目標値（秒単位）
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export enum ChallengeStatus {
  DECLARED = "declared",         // 宣言済み
  IN_PROGRESS = "in_progress",   // 実行中
  COMPLETED = "completed",       // 完了
  CANCELLED = "cancelled"        // キャンセル
}

export interface Challenge {
  id: string;                    // UUID
  userId: string;                // ユーザーID
  templateId: string;            // テンプレートID
  title: string;                 // チャレンジタイトル（例: "東京マラソン2024"）
  goalType: string;              // 目標タイプID
  goalDetails: {                 // 目標詳細
    targetTime?: number;         // 目標タイム（秒）
    customGoal?: string;         // カスタム目標
  };
  targetDate: Date;              // 実施予定日
  status: ChallengeStatus;       // ステータス
  createdAt: Date;
  updatedAt: Date;
}

export enum AchievementLevel {
  GOLD = "gold",                 // 目標達成
  SILVER = "silver",             // 完走（目標未達成）
  BRONZE = "bronze"              // 挑戦（未完走）
}

export interface ChallengeResult {
  id: string;                    // UUID
  challengeId: string;           // チャレンジID
  resultData: {                  // 結果データ
    actualTime?: number;         // 実際のタイム（秒）
    isCompleted: boolean;        // 完走フラグ
    dnfReason?: string;          // 未完走理由
    additionalNotes?: string;    // 追加メモ
  };
  evidenceHash: string;          // 証拠画像のハッシュ
  evidenceUrl: string;           // 証拠画像のURL（IPFS）
  isAchieved: boolean;           // 目標達成フラグ
  achievementLevel: AchievementLevel; // 達成レベル
  submittedAt: Date;
}

export interface NFTMetadata {
  name: string;                  // NFT名
  description: string;           // 説明
  image: string;                 // 画像URL
  attributes: {                  // 属性
    challenge_type: string;
    goal_type: string;
    achievement_level: string;
    event_date: string;
    result_time?: string;
  };
}

export interface NFTRecord {
  id: string;                    // UUID
  challengeId: string;           // チャレンジID
  tokenId: string;               // NFTトークンID
  contractAddress: string;       // コントラクトアドレス
  metadata: NFTMetadata;         // NFTメタデータ
  imageUrl: string;              // NFT画像URL
  mintedAt: Date;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export enum ErrorType {
  VALIDATION_ERROR = "validation_error",
  AUTHENTICATION_ERROR = "authentication_error",
  AUTHORIZATION_ERROR = "authorization_error",
  NOT_FOUND_ERROR = "not_found_error",
  BLOCKCHAIN_ERROR = "blockchain_error",
  STORAGE_ERROR = "storage_error",
  INTERNAL_ERROR = "internal_error"
}

export interface APIError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

// Utility Types
export interface TimeFormat {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface UserStats {
  totalChallenges: number;
  completedChallenges: number;
  achievedGoals: number;
  averageTime?: number;
  bestTime?: number;
}