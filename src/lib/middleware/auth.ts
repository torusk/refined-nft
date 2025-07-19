import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    walletAddress: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = AuthService.verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Add user info to request
      (request as AuthenticatedRequest).user = decoded;

      return handler(request as AuthenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function getAuthUser(request: AuthenticatedRequest) {
  return request.user;
}