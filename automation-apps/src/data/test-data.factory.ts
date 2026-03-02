/**
 * Test data factory for mobile tests.
 * Mirrors the web factory to keep test data consistent across platforms.
 */

export interface UserCredentials {
  email: string;
  password: string;
}

export interface TestUser extends UserCredentials {
  firstName: string;
  lastName: string;
}

const testUsers: Record<string, TestUser> = {
  validUser: {
    email: 'valid.user@hydraqa.test',
    password: 'SecureP@ss123!',
    firstName: 'Hydra',
    lastName: 'Tester',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'SecureP@ss123!',
    firstName: 'Bad',
    lastName: 'Email',
  },
  weakPassword: {
    email: 'weak.pass@hydraqa.test',
    password: '123',
    firstName: 'Weak',
    lastName: 'Pass',
  },
};

export class TestDataFactory {
  static getUser(key: keyof typeof testUsers): TestUser {
    const user = testUsers[key];
    if (!user) throw new Error(`Unknown test user: ${String(key)}`);
    return { ...user };
  }

  static generateUniqueEmail(prefix = 'auto'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}@hydraqa.test`;
  }

  static generateRandomPassword(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}

