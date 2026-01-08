import crypto from 'crypto';

/**
 * EncryptionService
 *
 * Handles AES-256-GCM encryption for master seeds and sensitive data.
 * Uses PBKDF2 for key derivation from user passwords.
 *
 * Security Model:
 * - Master seeds encrypted with user-password-derived key (NOT server key)
 * - Private keys NEVER persisted (in-memory only)
 * - Each encryption uses unique salt and IV
 */

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 32; // 256 bits
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits

  /**
   * Derives an encryption key from a password using PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.PBKDF2_ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Encrypts data with AES-256-GCM using a password-derived key
   *
   * @param data - Plain text to encrypt
   * @param password - User password to derive encryption key
   * @returns Object containing encrypted data, salt, iv, and authTag
   */
  static encrypt(data: string, password: string): {
    encrypted: string;
    salt: string;
    iv: string;
    authTag: string;
  } {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Derive encryption key from password
      const key = this.deriveKey(password, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypts AES-256-GCM encrypted data
   *
   * @param encrypted - Hex-encoded encrypted data
   * @param password - User password to derive decryption key
   * @param salt - Hex-encoded salt used during encryption
   * @param iv - Hex-encoded initialization vector
   * @param authTag - Hex-encoded authentication tag
   * @returns Decrypted plain text
   */
  static decrypt(
    encrypted: string,
    password: string,
    salt: string,
    iv: string,
    authTag: string
  ): string {
    try {
      // Convert hex strings back to buffers
      const saltBuffer = Buffer.from(salt, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      const authTagBuffer = Buffer.from(authTag, 'hex');

      // Derive decryption key
      const key = this.deriveKey(password, saltBuffer);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, ivBuffer);
      decipher.setAuthTag(authTagBuffer);

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Invalid password or corrupted data'}`);
    }
  }

  /**
   * Combines encrypted data into a single storage-friendly format
   * Format: salt:iv:authTag:encrypted
   */
  static packEncrypted(encrypted: {
    encrypted: string;
    salt: string;
    iv: string;
    authTag: string;
  }): string {
    return `${encrypted.salt}:${encrypted.iv}:${encrypted.authTag}:${encrypted.encrypted}`;
  }

  /**
   * Unpacks combined encrypted data format
   */
  static unpackEncrypted(packed: string): {
    encrypted: string;
    salt: string;
    iv: string;
    authTag: string;
  } {
    const parts = packed.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    return {
      salt: parts[0],
      iv: parts[1],
      authTag: parts[2],
      encrypted: parts[3]
    };
  }

  /**
   * Hashes data using SHA-256 (for token hashing, not passwords)
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generates a cryptographically secure random string
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Securely wipes a string from memory (best effort)
   */
  static wipeString(str: string): void {
    // Note: JavaScript doesn't provide guaranteed memory wiping
    // This is a best-effort approach
    if (str && typeof str === 'string') {
      // Overwrite with random data
      for (let i = 0; i < str.length; i++) {
        str = str.substring(0, i) + crypto.randomBytes(1).toString('hex')[0] + str.substring(i + 1);
      }
    }
  }
}

export default EncryptionService;
