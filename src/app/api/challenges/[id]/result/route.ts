import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/middleware/auth';
import { ResultService } from '@/services/resultService';

// Only import services on server side
let ChallengeService: any;

if (typeof window === 'undefined') {
  ChallengeService = require('@/services/challengeService').ChallengeService;
}

// Submit challenge result
export const POST = withAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challengeId = params.id;
    const { resultData, evidenceHash, evidenceUrl } = await request.json();

    // Validate required fields
    if (!resultData || !evidenceHash || !evidenceUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate result data structure
    if (typeof resultData.isCompleted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid result data: isCompleted must be boolean' },
        { status: 400 }
      );
    }

    if (resultData.isCompleted && (!resultData.actualTime || resultData.actualTime <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Actual time is required for completed challenges' },
        { status: 400 }
      );
    }

    if (!resultData.isCompleted && !resultData.dnfReason?.trim()) {
      return NextResponse.json(
        { success: false, error: 'DNF reason is required for incomplete challenges' },
        { status: 400 }
      );
    }

    // Check if challenge exists and belongs to user
    let challenge = null;
    try {
      if (ChallengeService) {
        challenge = await ChallengeService.getChallengeById(challengeId);
      }
    } catch (error) {
      // Fallback for mock mode
      console.log('Using mock mode for challenge validation');
    }

    if (challenge && challenge.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Submit result
    const result = await ResultService.submitResult(
      challengeId,
      resultData,
      evidenceHash,
      evidenceUrl
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Submit result error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get challenge result
export const GET = withAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challengeId = params.id;

    // Check if challenge exists and belongs to user
    let challenge = null;
    try {
      if (ChallengeService) {
        challenge = await ChallengeService.getChallengeById(challengeId);
      }
    } catch (error) {
      // Fallback for mock mode
      console.log('Using mock mode for challenge validation');
    }

    if (challenge && challenge.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const result = await ResultService.getResultByChallengeId(challengeId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Result not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Get result error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});