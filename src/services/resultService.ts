import { ChallengeResult, AchievementLevel, Challenge } from '@/types';

// Only import database connection on server side
let getConnection: any;
let generateUUID: any;

if (typeof window === 'undefined') {
  // Server-side only imports
  const dbModule = require('@/lib/database/connection');
  getConnection = dbModule.getConnection;
  generateUUID = dbModule.generateUUID;
}

export class ResultService {
  // Submit challenge result
  static async submitResult(
    challengeId: string,
    resultData: {
      isCompleted: boolean;
      actualTime?: number;
      dnfReason?: string;
      additionalNotes?: string;
    },
    evidenceHash: string,
    evidenceUrl: string
  ): Promise<ChallengeResult> {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      return this.createMockResult(challengeId, resultData, evidenceHash, evidenceUrl);
    }

    const connection = await getConnection();
    
    // Check if result already exists
    const [existingResults] = await connection.execute(
      'SELECT id FROM challenge_results WHERE challenge_id = ?',
      [challengeId]
    );

    if (Array.isArray(existingResults) && existingResults.length > 0) {
      throw new Error('Result already submitted for this challenge');
    }

    // Get challenge details for achievement calculation
    const [challenges] = await connection.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (!Array.isArray(challenges) || challenges.length === 0) {
      throw new Error('Challenge not found');
    }

    const challenge = challenges[0] as any;
    const goalDetails = JSON.parse(challenge.goal_details || '{}');

    // Calculate achievement
    const { isAchieved, achievementLevel } = this.calculateAchievement(
      challenge.goal_type,
      goalDetails,
      resultData
    );

    const resultId = generateUUID();
    const now = new Date();

    await connection.execute(
      `INSERT INTO challenge_results 
       (id, challenge_id, result_data, evidence_hash, evidence_url, is_achieved, achievement_level, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resultId,
        challengeId,
        JSON.stringify(resultData),
        evidenceHash,
        evidenceUrl,
        isAchieved,
        achievementLevel,
        now,
      ]
    );

    // Update challenge status
    await connection.execute(
      'UPDATE challenges SET status = ?, updated_at = ? WHERE id = ?',
      ['completed', now, challengeId]
    );

    return {
      id: resultId,
      challengeId,
      resultData,
      evidenceHash,
      evidenceUrl,
      isAchieved,
      achievementLevel,
      submittedAt: now,
    };
  }

  // Calculate achievement level
  static calculateAchievement(
    goalType: string,
    goalDetails: any,
    resultData: {
      isCompleted: boolean;
      actualTime?: number;
      dnfReason?: string;
      additionalNotes?: string;
    }
  ): { isAchieved: boolean; achievementLevel: AchievementLevel } {
    // If not completed, always bronze
    if (!resultData.isCompleted) {
      return {
        isAchieved: false,
        achievementLevel: AchievementLevel.BRONZE,
      };
    }

    // If completion goal, always achieved with gold
    if (goalType === 'completion') {
      return {
        isAchieved: true,
        achievementLevel: AchievementLevel.GOLD,
      };
    }

    // For time-based goals, compare actual time with target
    const targetTime = goalDetails.targetTime;
    const actualTime = resultData.actualTime;

    if (!targetTime || !actualTime) {
      // Completed but no time comparison possible
      return {
        isAchieved: true,
        achievementLevel: AchievementLevel.SILVER,
      };
    }

    if (actualTime <= targetTime) {
      // Goal achieved
      return {
        isAchieved: true,
        achievementLevel: AchievementLevel.GOLD,
      };
    } else {
      // Completed but goal not achieved
      return {
        isAchieved: false,
        achievementLevel: AchievementLevel.SILVER,
      };
    }
  }

  // Get result by challenge ID
  static async getResultByChallengeId(challengeId: string): Promise<ChallengeResult | null> {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      return null; // No mock results for now
    }

    const connection = await getConnection();
    
    const [results] = await connection.execute(
      'SELECT * FROM challenge_results WHERE challenge_id = ?',
      [challengeId]
    );

    if (Array.isArray(results) && results.length > 0) {
      const result = results[0] as any;
      return {
        id: result.id,
        challengeId: result.challenge_id,
        resultData: JSON.parse(result.result_data),
        evidenceHash: result.evidence_hash,
        evidenceUrl: result.evidence_url,
        isAchieved: result.is_achieved,
        achievementLevel: result.achievement_level,
        submittedAt: result.submitted_at,
      };
    }

    return null;
  }

  // Create mock result for development
  private static createMockResult(
    challengeId: string,
    resultData: any,
    evidenceHash: string,
    evidenceUrl: string
  ): ChallengeResult {
    // Simple mock achievement calculation
    const isCompleted = resultData.isCompleted;
    const hasTargetTime = resultData.actualTime && resultData.actualTime > 0;
    
    let isAchieved = false;
    let achievementLevel = AchievementLevel.BRONZE;

    if (isCompleted) {
      if (hasTargetTime) {
        // Mock: assume goal achieved if time is reasonable (under 5 hours)
        isAchieved = resultData.actualTime <= 18000; // 5 hours
        achievementLevel = isAchieved ? AchievementLevel.GOLD : AchievementLevel.SILVER;
      } else {
        isAchieved = true;
        achievementLevel = AchievementLevel.GOLD;
      }
    }

    return {
      id: `mock-result-${Date.now()}`,
      challengeId,
      resultData,
      evidenceHash,
      evidenceUrl,
      isAchieved,
      achievementLevel,
      submittedAt: new Date(),
    };
  }

  // Update result (if allowed)
  static async updateResult(
    resultId: string,
    updates: {
      resultData?: any;
      evidenceHash?: string;
      evidenceUrl?: string;
    }
  ): Promise<ChallengeResult | null> {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      throw new Error('Update not supported in mock mode');
    }

    const connection = await getConnection();
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.resultData !== undefined) {
      updateFields.push('result_data = ?');
      updateValues.push(JSON.stringify(updates.resultData));
    }

    if (updates.evidenceHash !== undefined) {
      updateFields.push('evidence_hash = ?');
      updateValues.push(updates.evidenceHash);
    }

    if (updates.evidenceUrl !== undefined) {
      updateFields.push('evidence_url = ?');
      updateValues.push(updates.evidenceUrl);
    }

    if (updateFields.length === 0) {
      return this.getResultById(resultId);
    }

    updateValues.push(resultId);

    await connection.execute(
      `UPDATE challenge_results SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return this.getResultById(resultId);
  }

  // Get result by ID
  static async getResultById(resultId: string): Promise<ChallengeResult | null> {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      return null;
    }

    const connection = await getConnection();
    
    const [results] = await connection.execute(
      'SELECT * FROM challenge_results WHERE id = ?',
      [resultId]
    );

    if (Array.isArray(results) && results.length > 0) {
      const result = results[0] as any;
      return {
        id: result.id,
        challengeId: result.challenge_id,
        resultData: JSON.parse(result.result_data),
        evidenceHash: result.evidence_hash,
        evidenceUrl: result.evidence_url,
        isAchieved: result.is_achieved,
        achievementLevel: result.achievement_level,
        submittedAt: result.submitted_at,
      };
    }

    return null;
  }

  // Delete result
  static async deleteResult(resultId: string): Promise<boolean> {
    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      return true; // Mock success
    }

    const connection = await getConnection();
    
    try {
      await connection.execute('DELETE FROM challenge_results WHERE id = ?', [resultId]);
      return true;
    } catch (error) {
      console.error('Error deleting result:', error);
      return false;
    }
  }
}