import { NextRequest, NextResponse } from 'next/server';
import { generateUUID } from '@/lib/database/connection';

// Generate nonce for wallet authentication
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Generate a unique nonce
    const nonce = generateUUID();

    // In a production app, you might want to store this nonce temporarily
    // For now, we'll just return it
    return NextResponse.json({
      success: true,
      data: { nonce }
    });

  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}