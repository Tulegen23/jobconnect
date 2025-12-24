import { User } from '../../models/User';
import { IContext } from '../context';

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      const user = await User.findById(context.user.userId).lean();
      if (!user || user.isDeleted) {
        throw new Error('User not found');
      }
      return user;
    },

    user: async (_: unknown, args: { id: string }) => {
      const user = await User.findById(args.id).lean();
      if (!user || user.isDeleted) {
        throw new Error('User not found');
      }
      return user;
    },

    users: async (
      _: unknown,
      args: { role?: string; limit?: number; offset?: number }
    ) => {
      const query: any = { isDeleted: false };
      if (args.role) {
        query.role = args.role;
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return User.find(query).limit(limit).skip(offset).lean();
    },
  },

  User: {
    id: (user: any) => user._id.toString(),
  },
};

