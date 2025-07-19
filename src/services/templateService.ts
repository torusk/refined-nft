import { ChallengeTemplate, GoalType } from '@/types';

// Only import database connection on server side
let getConnection: any;

if (typeof window === 'undefined') {
  // Server-side only imports
  const dbModule = require('@/lib/database/connection');
  getConnection = dbModule.getConnection;
}

export class TemplateService {
  // Get all active templates
  static async getActiveTemplates(): Promise<ChallengeTemplate[]> {
    const connection = await getConnection();
    
    const [templates] = await connection.execute(
      'SELECT * FROM challenge_templates WHERE is_active = true ORDER BY created_at DESC'
    );

    return (templates as any[]).map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      goalTypes: JSON.parse(template.goal_types),
      validationRules: JSON.parse(template.validation_rules || '[]'),
      isActive: template.is_active,
      createdAt: template.created_at,
    }));
  }

  // Get template by ID
  static async getTemplateById(templateId: string): Promise<ChallengeTemplate | null> {
    const connection = await getConnection();
    
    const [templates] = await connection.execute(
      'SELECT * FROM challenge_templates WHERE id = ?',
      [templateId]
    );

    if (Array.isArray(templates) && templates.length > 0) {
      const template = templates[0] as any;
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        goalTypes: JSON.parse(template.goal_types),
        validationRules: JSON.parse(template.validation_rules || '[]'),
        isActive: template.is_active,
        createdAt: template.created_at,
      };
    }

    return null;
  }

  // Get marathon template (default)
  static async getMarathonTemplate(): Promise<ChallengeTemplate | null> {
    return this.getTemplateById('marathon-template-001');
  }

  // Validate goal type for template
  static validateGoalType(template: ChallengeTemplate, goalTypeId: string): boolean {
    return template.goalTypes.some(goalType => goalType.id === goalTypeId);
  }

  // Get goal type details
  static getGoalType(template: ChallengeTemplate, goalTypeId: string): GoalType | null {
    return template.goalTypes.find(goalType => goalType.id === goalTypeId) || null;
  }

  // Calculate target time for goal type
  static getTargetTimeForGoal(goalType: GoalType, customTime?: number): number | null {
    if (goalType.id === 'completion') {
      return null; // No specific time target for completion
    }
    
    if (goalType.id === 'custom' && customTime) {
      return customTime;
    }
    
    return goalType.targetValue || null;
  }

  // Validate challenge data against template rules
  static validateChallengeData(
    template: ChallengeTemplate,
    data: {
      title: string;
      goalType: string;
      targetDate: Date;
      goalDetails?: any;
    }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if goal type is valid
    if (!this.validateGoalType(template, data.goalType)) {
      errors.push('Invalid goal type for this template');
    }

    // Apply validation rules
    template.validationRules.forEach(rule => {
      switch (rule.field) {
        case 'title':
          if (rule.rule === 'required' && !data.title.trim()) {
            errors.push(rule.message);
          }
          break;
        case 'targetDate':
          if (rule.rule === 'future' && data.targetDate <= new Date()) {
            errors.push(rule.message);
          }
          break;
      }
    });

    // Validate custom goal time if applicable
    if (data.goalType === 'custom') {
      if (!data.goalDetails?.targetTime || data.goalDetails.targetTime <= 0) {
        errors.push('Custom goal requires a valid target time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get formatted goal types for UI
  static getFormattedGoalTypes(template: ChallengeTemplate) {
    return template.goalTypes.map(goalType => ({
      ...goalType,
      displayText: goalType.targetValue 
        ? `${goalType.name} (${this.formatTargetTime(goalType.targetValue)})`
        : goalType.name,
    }));
  }

  // Format target time for display
  private static formatTargetTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes.toString().padStart(2, '0')}分`;
    }
    return `${minutes}分`;
  }
}