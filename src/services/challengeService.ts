import { Challenge, ChallengeStatus } from '@/types';

// Only import database connection and other services on server side
let getConnection: any;
let generateUUID: any;
let TemplateService: any;

if (typeof window === 'undefined') {
  // Server-side only imports
  const dbModule = require('@/lib/database/connection');
  getConnection = dbModule.getConnection;
  generateUUID = dbModule.generateUUID;
  TemplateService = require('./templateService').TemplateService;
}

export class ChallengeService {
  // Create new challenge
  static async createChallenge(
    userId: string,
    challengeData: {
      templateId: string;
      title: string;
      targetDate: string;
      goalType: string;
      goalDetails?: any;
    }
  ): Promise<Challenge> {
    const connection = await getConnection();
    
    // Validate template
    const template = await TemplateService.getTemplateById(challengeData.templateId);
    if (!template) {
      throw new Error('Invalid template');
    }

    // Validate challenge data against template
    const validation = TemplateService.validateChallengeData(template, {
      title: challengeData.title,
      goalType: challengeData.goalType,
      targetDate: new Date(challengeData.targetDate),
      goalDetails: challengeData.goalDetails,
    });

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const challengeId = generateUUID();
    const now = new Date();
    const targetDate = new Date(challengeData.targetDate);

    // Prepare goal details
    let goalDetails = challengeData.goalDetails || {};
    
    // Add target time from goal type if not custom
    if (challengeData.goalType !== 'custom') {
      const goalType = TemplateService.getGoalType(template, challengeData.goalType);
      if (goalType?.targetValue) {
        goalDetails.targetTime = goalType.targetValue;
      }
    }

    await connection.execute(
      `INSERT INTO challenges 
       (id, user_id, template_id, title, goal_type, goal_details, target_date, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        challengeId,
        userId,
        challengeData.templateId,
        challengeData.title,
        challengeData.goalType,
        JSON.stringify(goalDetails),
        targetDate,
        ChallengeStatus.DECLARED,
        now,
        now,
      ]
    );

    return this.getChallengeById(challengeId) as Promise<Challenge>;
  }

  // Get challenge by ID
  static async getChallengeById(challengeId: string): Promise<Challenge | null> {
    const connection = await getConnection();
    
    const [challenges] = await connection.execute(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );

    if (Array.isArray(challenges) && challenges.length > 0) {
      const challenge = challenges[0] as any;
      return {
        id: challenge.id,
        userId: challenge.user_id,
        templateId: challenge.template_id,
        title: challenge.title,
        goalType: challenge.goal_type,
        goalDetails: JSON.parse(challenge.goal_details || '{}'),
        targetDate: challenge.target_date,
        status: challenge.status,
        createdAt: challenge.created_at,
        updatedAt: challenge.updated_at,
      };
    }

    return null;
  }

  // Get challenges by user ID
  static async getChallengesByUserId(userId: string): Promise<Challenge[]> {
    const connection = await getConnection();
    
    const [challenges] = await connection.execute(
      'SELECT * FROM challenges WHERE user_id = ? ORDER BY target_date DESC',
      [userId]
    );

    return (challenges as any[]).map(challenge => ({
      id: challenge.id,
      userId: challenge.user_id,
      templateId: challenge.template_id,
      title: challenge.title,
      goalType: challenge.goal_type,
      goalDetails: JSON.parse(challenge.goal_details || '{}'),
      targetDate: challenge.target_date,
      status: challenge.status,
      createdAt: challenge.created_at,
      updatedAt: challenge.updated_at,
    }));
  }

  // Update challenge status
  static async updateChallengeStatus(
    challengeId: string,
    status: ChallengeStatus
  ): Promise<Challenge | null> {
    const connection = await getConnection();
    
    await connection.execute(
      'UPDATE challenges SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date(), challengeId]
    );

    return this.getChallengeById(challengeId);
  }

  // Update challenge
  static async updateChallenge(
    challengeId: string,
    updates: {
      title?: string;
      targetDate?: string;
      goalType?: string;
      goalDetails?: any;
    }
  ): Promise<Challenge | null> {
    const connection = await getConnection();
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updates.title);
    }

    if (updates.targetDate !== undefined) {
      updateFields.push('target_date = ?');
      updateValues.push(new Date(updates.targetDate));
    }

    if (updates.goalType !== undefined) {
      updateFields.push('goal_type = ?');
      updateValues.push(updates.goalType);
    }

    if (updates.goalDetails !== undefined) {
      updateFields.push('goal_details = ?');
      updateValues.push(JSON.stringify(updates.goalDetails));
    }

    if (updateFields.length === 0) {
      return this.getChallengeById(challengeId);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date());
    updateValues.push(challengeId);

    await connection.execute(
      `UPDATE challenges SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return this.getChallengeById(challengeId);
  }

  // Delete challenge (only if no result submitted)
  static async deleteChallenge(challengeId: string): Promise<boolean> {
    const connection = await getConnection();
    
    // Check if challenge has results
    const [results] = await connection.execute(
      'SELECT COUNT(*) as count FROM challenge_results WHERE challenge_id = ?',
      [challengeId]
    );

    if ((results as any[])[0].count > 0) {
      throw new Error('Cannot delete challenge with submitted results');
    }

    await connection.execute('DELETE FROM challenges WHERE id = ?', [challengeId]);
    return true;
  }

  // Get challenge with template and result info
  static async getChallengeWithDetails(challengeId: string) {
    const connection = await getConnection();
    
    const [challenges] = await connection.execute(
      `SELECT 
        c.*,
        ct.name as template_name,
        ct.description as template_description,
        cr.result_data,
        cr.evidence_url,
        cr.is_achieved,
        cr.achievement_level,
        cr.submitted_at,
        nr.token_id,
        nr.image_url as nft_image_url
       FROM challenges c
       LEFT JOIN challenge_templates ct ON c.template_id = ct.id
       LEFT JOIN challenge_results cr ON c.id = cr.challenge_id
       LEFT JOIN nft_records nr ON c.id = nr.challenge_id
       WHERE c.id = ?`,
      [challengeId]
    );

    if (Array.isArray(challenges) && challenges.length > 0) {
      const challenge = challenges[0] as any;
      return {
        id: challenge.id,
        userId: challenge.user_id,
        templateId: challenge.template_id,
        title: challenge.title,
        goalType: challenge.goal_type,
        goalDetails: JSON.parse(challenge.goal_details || '{}'),
        targetDate: challenge.target_date,
        status: challenge.status,
        createdAt: challenge.created_at,
        updatedAt: challenge.updated_at,
        template: {
          name: challenge.template_name,
          description: challenge.template_description,
        },
        result: challenge.result_data ? {
          data: JSON.parse(challenge.result_data),
          evidenceUrl: challenge.evidence_url,
          isAchieved: challenge.is_achieved,
          achievementLevel: challenge.achievement_level,
          submittedAt: challenge.submitted_at,
        } : null,
        nft: challenge.token_id ? {
          tokenId: challenge.token_id,
          imageUrl: challenge.nft_image_url,
        } : null,
      };
    }

    return null;
  }

  // Check if user can edit challenge
  static canEditChallenge(challenge: Challenge): boolean {
    return challenge.status === ChallengeStatus.DECLARED;
  }

  // Check if challenge is past due
  static isChallengeOverdue(challenge: Challenge): boolean {
    return new Date(challenge.targetDate) < new Date();
  }
}