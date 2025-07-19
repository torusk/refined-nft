import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/middleware/auth';
import { ChallengeService } from '@/services/challengeService';

// Create new challenge
export const POST = withAuth(async (request) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challengeData = await request.json();

    // Validate required fields
    const requiredFields = ['templateId', 'title', 'targetDate', 'goalType'];
    for (const field of requiredFields) {
      if (!challengeData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const challenge = await ChallengeService.createChallenge(user.userId, challengeData);

    return NextResponse.json({
      success: true,
      data: challenge
    });

  } catch (error: any) {
    console.error('Create challenge error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get user's challenges
export const GET = withAuth(async (request) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challenges = await ChallengeService.getChallengesByUserId(user.userId);

    return NextResponse.json({
      success: true,
      data: challenges
    });

  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});