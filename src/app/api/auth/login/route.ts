import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { mockUser } from '@/lib/mock/mockData';

export async function POST(request: NextRequest) {
  try {
    const { address, message, signature, nonce } = await request.json();

    if (!address || !message || !signature || !nonce) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use mock data if database is not configured
    if (process.env.NODE_ENV === 'development' && !process.env.DB_HOST) {
      const mockUserWithAddress = {
        ...mockUser,
        walletAddress: address.toLowerCase(),
      };
      
      const token = AuthService.generateToken(mockUserWithAddress);
      
      return NextResponse.json({
        success: true,
        data: {
          user: mockUserWithAddress,
          token
        }
      });
    }

    // Verify the signature
    const isValidSignature = await AuthService.verifySignature(
      address,
      message,
      signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Create or get user
    const user = await AuthService.createOrGetUser(address);

    // Generate JWT token
    const token = AuthService.generateToken(user);

    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to mock data on error
    const mockUserWithAddress = {
      ...mockUser,
      walletAddress: address?.toLowerCase() || mockUser.walletAddress,
    };
    
    const token = AuthService.generateToken(mockUserWithAddress);
    
    return NextResponse.json({
      success: true,
      data: {
        user: mockUserWithAddress,
        token
      }
    });
  }
}