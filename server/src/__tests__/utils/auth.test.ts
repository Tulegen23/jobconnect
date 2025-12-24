import { hashPassword, comparePassword, generateToken, verifyToken } from '../../utils/auth';
import { User } from '../../models/User';
import mongoose from 'mongoose';

describe('Auth Utils', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobconnect-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);

      const result = await comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);

      const result = await comparePassword('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });

  describe('generateToken and verifyToken', () => {
    it('should generate and verify token correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: await hashPassword('password'),
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate',
      });

      const token = generateToken(user);
      expect(token).toBeDefined();

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(user._id.toString());
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });
  });
});

