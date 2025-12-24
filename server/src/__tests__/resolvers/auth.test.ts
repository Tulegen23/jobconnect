import { User } from '../../models/User';
import { authResolvers } from '../../graphql/resolvers/auth';
import { hashPassword } from '../../utils/auth';
import mongoose from 'mongoose';

describe('Auth Resolvers', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobconnect-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate' as const,
      };

      const result = await authResolvers.Mutation.register(null, { input });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(input.email);
      expect(result.user.firstName).toBe(input.firstName);
      expect(result.user.lastName).toBe(input.lastName);
      expect(result.user.role).toBe(input.role);
    });

    it('should throw error if email already exists', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate' as const,
      };

      await authResolvers.Mutation.register(null, { input });

      await expect(authResolvers.Mutation.register(null, { input })).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should hash password before saving', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate' as const,
      };

      await authResolvers.Mutation.register(null, { input });

      const user = await User.findOne({ email: input.email });
      expect(user?.password).not.toBe(input.password);
      expect(user?.password).toHaveLength(60); // bcrypt hash length
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);

      const user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate',
      });
      await user.save();

      const result = await authResolvers.Mutation.login(null, {
        input: {
          email: 'test@example.com',
          password,
        },
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with incorrect email', async () => {
      await expect(
        authResolvers.Mutation.login(null, {
          input: {
            email: 'wrong@example.com',
            password: 'password123',
          },
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with incorrect password', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);

      const user = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate',
      });
      await user.save();

      await expect(
        authResolvers.Mutation.login(null, {
          input: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});

