// Client-side authentication utilities
import { ethers } from 'ethers';

export class ClientAuthService {
  // Generate authentication message
  static generateAuthMessage(address: string, nonce: string): string {
    return `Welcome to Marathon Challenge Protocol!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
  }

  // Verify token format (basic client-side validation)
  static isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  // Decode JWT payload (client-side only, don't trust this for security)
  static decodeTokenPayload(token: string): any {
    try {
      const parts = token.split('.');
      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}