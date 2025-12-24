import { z } from 'zod';
import { Company } from '../../models/Company';
import { User } from '../../models/User';
import { IContext } from '../context';

const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(50).max(2000),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().min(1),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  location: z.string().min(1),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

const updateCompanySchema = createCompanySchema.partial();

export const companyResolvers = {
  Query: {
    company: async (_: unknown, args: { id: string }) => {
      const company = await Company.findById(args.id)
        .populate('owner')
        .populate('employees')
        .lean();
      if (!company || company.isDeleted) {
        throw new Error('Company not found');
      }
      return company;
    },

    companies: async (_: unknown, args: { limit?: number; offset?: number }) => {
      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return Company.find({ isDeleted: false })
        .populate('owner')
        .limit(limit)
        .skip(offset)
        .lean();
    },

    myCompany: async (_: unknown, __: unknown, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can access company');
      }

      const company = await Company.findOne({
        owner: context.user.userId,
        isDeleted: false,
      })
        .populate('owner')
        .populate('employees')
        .lean();

      return company;
    },
  },

  Mutation: {
    createCompany: async (
      _: unknown,
      args: { input: z.infer<typeof createCompanySchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can create companies');
      }

      const validated = createCompanySchema.parse(args.input);

      const existingCompany = await Company.findOne({
        owner: context.user.userId,
        isDeleted: false,
      });
      if (existingCompany) {
        throw new Error('You already have a company');
      }

      const company = new Company({
        ...validated,
        owner: context.user.userId,
      });

      await company.save();
      await company.populate('owner');

      return company.toObject();
    },

    updateCompany: async (
      _: unknown,
      args: { id: string; input: z.infer<typeof updateCompanySchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const validated = updateCompanySchema.parse(args.input);
      const company = await Company.findById(args.id);

      if (!company || company.isDeleted) {
        throw new Error('Company not found');
      }

      if (company.owner.toString() !== context.user.userId) {
        throw new Error('You can only update your own company');
      }

      Object.assign(company, validated);
      await company.save();
      await company.populate('owner');
      await company.populate('employees');

      return company.toObject();
    },

    deleteCompany: async (_: unknown, args: { id: string }, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const company = await Company.findById(args.id);
      if (!company || company.isDeleted) {
        throw new Error('Company not found');
      }

      if (company.owner.toString() !== context.user.userId) {
        throw new Error('You can only delete your own company');
      }

      company.isDeleted = true;
      await company.save();

      return true;
    },
  },

  Company: {
    id: (company: any) => company._id.toString(),
  },
};

