import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/middleware/auth';
import { ChallengeService } from '@/services/challengeService';

// Get challenge by ID
export const GET = withAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challenge = await ChallengeService.getChallengeWithDetails(params.id);

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if user owns this challenge
    if (challenge.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: challenge
    });

  } catch (error) {
    console.error('Get challenge error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Update challenge
export const PUT = withAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challenge = await ChallengeService.getChallengeById(params.id);

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if user owns this challenge
    if (challenge.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if challenge can be edited
    if (!ChallengeService.canEditChallenge(challenge)) {
      return NextResponse.json(
        { success: false, error: 'Challenge cannot be edited in current status' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const updatedChallenge = await ChallengeService.updateChallenge(params.id, updates);

    return NextResponse.json({
      success: true,
      data: updatedChallenge
    });

  } catch (error: any) {
    console.error('Update challenge error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});

// Delete challenge
export const DELETE = withAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const challenge = await ChallengeService.getChallengeById(params.id);

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if user owns this challenge
    if (challenge.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    await ChallengeService.deleteChallenge(params.id);

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete challenge error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});