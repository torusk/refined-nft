import { NextRequest, NextResponse } from 'next/server';
import { withAuth, getAuthUser } from '@/lib/middleware/auth';
import { UserService } from '@/services/userService';

// Get user profile
export const GET = withAuth(async (request) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = await UserService.getUserById(user.userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Update user profile
export const PUT = withAuth(async (request) => {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { displayName, bio } = await request.json();

    // Validate input
    if (displayName && displayName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Display name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bio must be 500 characters or less' },
        { status: 400 }
      );
    }

    const updatedProfile = await UserService.updateProfile(user.userId, {
      displayName,
      bio,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});