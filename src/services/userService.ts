import { User, UserStats } from '@/types';

// Only import database connection on server side
let getConnection: any;

if (typeof window === 'undefined') {
  // Server-side only imports
  const dbModule = require('@/lib/database/connection');
  getConnection = dbModule.getConnection;
}

export class UserService {
  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const connection = await getConnection();
    
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (Array.isArray(users) && users.length > 0) {
      const user = users[0] as any;
      return {
        id: user.id,
        walletAddress: user.wallet_address,
        displayName: user.display_name,
        bio: user.bio,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }

    return null;
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    updates: { displayName?: string; bio?: string }
  ): Promise<User | null> {
    const connection = await getConnection();
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (updates.displayName !== undefined) {
      updateFields.push('display_name = ?');
      updateValues.push(updates.displayName);
    }

    if (updates.bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(updates.bio);
    }

    if (updateFields.length === 0) {
      return this.getUserById(userId);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date());
    updateValues.push(userId);

    await connection.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return this.getUserById(userId);
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<UserStats> {
    const connection = await getConnection();
    
    // Get total challenges
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM challenges WHERE user_id = ?',
      [userId]
    );
    const totalChallenges = (totalResult as any[])[0].total;

    // Get completed challenges
    const [completedResult] = await connection.execute(
      `SELECT COUNT(*) as completed FROM challenges c 
       JOIN challenge_results cr ON c.id = cr.challenge_id 
       WHERE c.user_id = ? AND cr.result_data->>'$.isCompleted' = 'true'`,
      [userId]
    );
    const completedChallenges = (completedResult as any[])[0].completed;

    // Get achieved goals
    const [achievedResult] = await connection.execute(
      `SELECT COUNT(*) as achieved FROM challenges c 
       JOIN challenge_results cr ON c.id = cr.challenge_id 
       WHERE c.user_id = ? AND cr.is_achieved = true`,
      [userId]
    );
    const achievedGoals = (achievedResult as any[])[0].achieved;

    // Get average time (for completed challenges)
    const [avgTimeResult] = await connection.execute(
      `SELECT AVG(CAST(cr.result_data->>'$.actualTime' AS UNSIGNED)) as avgTime 
       FROM challenges c 
       JOIN challenge_results cr ON c.id = cr.challenge_id 
       WHERE c.user_id = ? AND cr.result_data->>'$.isCompleted' = 'true' 
       AND cr.result_data->>'$.actualTime' IS NOT NULL`,
      [userId]
    );
    const averageTime = (avgTimeResult as any[])[0].avgTime;

    // Get best time
    const [bestTimeResult] = await connection.execute(
      `SELECT MIN(CAST(cr.result_data->>'$.actualTime' AS UNSIGNED)) as bestTime 
       FROM challenges c 
       JOIN challenge_results cr ON c.id = cr.challenge_id 
       WHERE c.user_id = ? AND cr.result_data->>'$.isCompleted' = 'true' 
       AND cr.result_data->>'$.actualTime' IS NOT NULL`,
      [userId]
    );
    const bestTime = (bestTimeResult as any[])[0].bestTime;

    return {
      totalChallenges,
      completedChallenges,
      achievedGoals,
      averageTime: averageTime ? Math.round(averageTime) : undefined,
      bestTime: bestTime || undefined,
    };
  }

  // Get user's challenge history with results
  static async getUserChallengeHistory(userId: string) {
    const connection = await getConnection();
    
    const [challenges] = await connection.execute(
      `SELECT 
        c.*,
        cr.result_data,
        cr.evidence_url,
        cr.is_achieved,
        cr.achievement_level,
        cr.submitted_at,
        nr.token_id,
        nr.image_url as nft_image_url
       FROM challenges c
       LEFT JOIN challenge_results cr ON c.id = cr.challenge_id
       LEFT JOIN nft_records nr ON c.id = nr.challenge_id
       WHERE c.user_id = ?
       ORDER BY c.target_date DESC`,
      [userId]
    );

    return challenges;
  }

  // Delete user account
  static async deleteUser(userId: string): Promise<boolean> {
    const connection = await getConnection();
    
    try {
      await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}