import { z } from 'zod';
import { User } from '../../models/User';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth';
import { IContext } from '../context';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z.enum(['candidate', 'employer']),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authResolvers = {
  Mutation: {
    register: async (_: unknown, args: { input: z.infer<typeof registerSchema> }) => {
      const validated = registerSchema.parse(args.input);

      const existingUser = await User.findOne({ email: validated.email, isDeleted: false });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await hashPassword(validated.password);
      const user = new User({
        ...validated,
        password: hashedPassword,
      });

      await user.save();

      const token = generateToken(user);
      return {
        token,
        user: user.toObject(),
      };
    },

    login: async (_: unknown, args: { input: z.infer<typeof loginSchema> }) => {
      const validated = loginSchema.parse(args.input);

      const user = await User.findOne({ email: validated.email, isDeleted: false });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await comparePassword(validated.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user);
      return {
        token,
        user: user.toObject(),
      };
    },
  },
};

