import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { getConnection, generateUUID } from '@/lib/database/connection';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  // Generate authentication message
  static generateAuthMessage(address: string, nonce: string): string {
    return `Welcome to Marathon Challenge Protocol!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
  }

  // Verify wallet signature
  static async verifySignature(
    address: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Create or get user
  static async createOrGetUser(walletAddress: string): Promise<User> {
    const connection = await getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE wallet_address = ?',
      [walletAddress.toLowerCase()]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      const user = existingUsers[0] as any;
      return {
        id: user.id,
        walletAddress: user.wallet_address,
        displayName: user.display_name,
        bio: user.bio,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    }

    // Create new user
    const userId = generateUUID();
    const now = new Date();

    await connection.execute(
      'INSERT INTO users (id, wallet_address, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [userId, walletAddress.toLowerCase(), now, now]
    );

    return {
      id: userId,
      walletAddress: walletAddress.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
  }

  // Generate JWT token
  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string; walletAddress: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        walletAddress: decoded.walletAddress,
      };
    } catch (error) {
      return null;
    }
  }

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
}