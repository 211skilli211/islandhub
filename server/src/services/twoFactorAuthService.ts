// @ts-ignore - No type declarations available for speakeasy
import speakeasy from 'speakeasy';
// @ts-ignore - No type declarations available for qrcode
import QRCode from 'qrcode';
import { pool } from '../config/db';
import { securityConfig } from '../config/security';

/**
 * Two-Factor Authentication Service
 * Implements TOTP (Time-based One-Time Password) using speakeasy
 */
export class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret for a user
   */
  static async generateSecret(userId: number, email: string) {
    const secret = speakeasy.generateSecret({
      name: `IslandFund (${email})`,
      issuer: securityConfig.twoFactor.issuer,
      length: 32,
    });

    // Store encrypted secret in database
    await pool.query(
      `UPDATE users 
       SET two_factor_secret = $1, 
           two_factor_enabled = false,
           two_factor_backup_codes = $2
       WHERE user_id = $3`,
      [
        secret.base32,
        JSON.stringify(this.generateBackupCodes()),
        userId
      ]
    );

    // Generate QR code for authenticator apps
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(userId: number, token: string): boolean {
    // Get user's secret from database
    // This would be called after fetching the secret
    return false; // Placeholder - needs database integration
  }

  /**
   * Verify TOTP token with provided secret
   */
  static verifyTokenWithSecret(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) drift
    });
  }

  /**
   * Enable 2FA for user after verification
   */
  static async enableTwoFactor(userId: number, token: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
      return false;
    }

    const secret = result.rows[0].two_factor_secret;
    const isValid = this.verifyTokenWithSecret(secret, token);

    if (isValid) {
      await pool.query(
        'UPDATE users SET two_factor_enabled = true WHERE user_id = $1',
        [userId]
      );
      return true;
    }

    return false;
  }

  /**
   * Disable 2FA for user
   */
  static async disableTwoFactor(userId: number): Promise<void> {
    await pool.query(
      `UPDATE users 
       SET two_factor_secret = NULL, 
           two_factor_enabled = false,
           two_factor_backup_codes = NULL
       WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Generate backup codes for account recovery
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < securityConfig.twoFactor.backupCodesCount; i++) {
      codes.push(
        Array(8)
          .fill(0)
          .map(() => Math.random().toString(36).charAt(2))
          .join('')
          .toUpperCase()
      );
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT two_factor_backup_codes FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) return false;

    const backupCodes: string[] = result.rows[0].two_factor_backup_codes || [];
    const index = backupCodes.indexOf(code.toUpperCase());

    if (index > -1) {
      // Remove used backup code
      backupCodes.splice(index, 1);
      await pool.query(
        'UPDATE users SET two_factor_backup_codes = $1 WHERE user_id = $2',
        [JSON.stringify(backupCodes), userId]
      );
      return true;
    }

    return false;
  }

  /**
   * Check if 2FA is enabled for user
   */
  static async isTwoFactorEnabled(userId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT two_factor_enabled FROM users WHERE user_id = $1',
      [userId]
    );

    return result.rows[0]?.two_factor_enabled || false;
  }
}

export default TwoFactorAuthService;
