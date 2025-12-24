import { z } from 'zod';
import { Job } from '../../models/Job';
import { Company } from '../../models/Company';
import { IContext } from '../context';
import { pubsub } from './pubsub';

const createJobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(100).max(5000),
  requirements: z.array(z.string()).min(1),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.string().default('USD'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  location: z.string().min(1),
  remote: z.boolean().default(false),
  category: z.string().min(1),
  experienceLevel: z.enum(['junior', 'middle', 'senior', 'lead']),
  skills: z.array(z.string()),
});

const updateJobSchema = createJobSchema.partial().extend({
  status: z.enum(['draft', 'published', 'closed']).optional(),
});

export const jobResolvers = {
  Query: {
    job: async (_: unknown, args: { id: string }) => {
      const job = await Job.findById(args.id).populate('company').lean();
      if (!job || job.isDeleted) {
        throw new Error('Job not found');
      }

      await Job.findByIdAndUpdate(args.id, { $inc: { viewsCount: 1 } });

      return job;
    },

    jobs: async (
      _: unknown,
      args: {
        filters?: {
          category?: string;
          location?: string;
          remote?: boolean;
          employmentType?: string;
          experienceLevel?: string;
          salaryMin?: number;
          skills?: string[];
          search?: string;
        };
        limit?: number;
        offset?: number;
      }
    ) => {
      const query: any = { isDeleted: false, status: 'published' };

      if (args.filters) {
        if (args.filters.category) {
          query.category = args.filters.category;
        }
        if (args.filters.location) {
          query.location = { $regex: args.filters.location, $options: 'i' };
        }
        if (args.filters.remote !== undefined) {
          query.remote = args.filters.remote;
        }
        if (args.filters.employmentType) {
          query.employmentType = args.filters.employmentType;
        }
        if (args.filters.experienceLevel) {
          query.experienceLevel = args.filters.experienceLevel;
        }
        if (args.filters.salaryMin) {
          query.$or = [
            { salaryMin: { $gte: args.filters.salaryMin } },
            { salaryMax: { $gte: args.filters.salaryMin } },
          ];
        }
        if (args.filters.skills && args.filters.skills.length > 0) {
          query.skills = { $in: args.filters.skills };
        }
        if (args.filters.search) {
          query.$or = [
            { title: { $regex: args.filters.search, $options: 'i' } },
            { description: { $regex: args.filters.search, $options: 'i' } },
          ];
        }
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return Job.find(query)
        .populate('company')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    },

    myJobs: async (
      _: unknown,
      args: { status?: string; limit?: number; offset?: number },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can access their jobs');
      }

      const company = await Company.findOne({
        owner: context.user.userId,
        isDeleted: false,
      });

      if (!company) {
        return [];
      }

      const query: any = {
        company: company._id,
        isDeleted: false,
      };

      if (args.status) {
        query.status = args.status;
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return Job.find(query)
        .populate('company')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    },
  },

  Mutation: {
    createJob: async (
      _: unknown,
      args: { input: z.infer<typeof createJobSchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can create jobs');
      }

      const validated = createJobSchema.parse(args.input);

      const company = await Company.findOne({
        owner: context.user.userId,
        isDeleted: false,
      });

      if (!company) {
        throw new Error('You need to create a company first');
      }

      const job = new Job({
        ...validated,
        company: company._id,
        status: 'draft',
      });

      await job.save();
      await job.populate('company');

      return job.toObject();
    },

    updateJob: async (
      _: unknown,
      args: { id: string; input: z.infer<typeof updateJobSchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const validated = updateJobSchema.parse(args.input);
      const job = await Job.findById(args.id).populate('company');

      if (!job || job.isDeleted) {
        throw new Error('Job not found');
      }

      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== context.user.userId) {
        throw new Error('You can only update jobs from your company');
      }

      Object.assign(job, validated);
      await job.save();
      await job.populate('company');

      return job.toObject();
    },

    publishJob: async (_: unknown, args: { id: string }, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const job = await Job.findById(args.id).populate('company');
      if (!job || job.isDeleted) {
        throw new Error('Job not found');
      }

      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== context.user.userId) {
        throw new Error('You can only publish jobs from your company');
      }

      job.status = 'published';
      await job.save();
      await job.populate('company');

      pubsub.publish('JOB_CREATED', { jobCreated: job.toObject() });

      return job.toObject();
    },

    deleteJob: async (_: unknown, args: { id: string }, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const job = await Job.findById(args.id);
      if (!job || job.isDeleted) {
        throw new Error('Job not found');
      }

      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== context.user.userId) {
        throw new Error('You can only delete jobs from your company');
      }

      job.isDeleted = true;
      await job.save();

      return true;
    },
  },

  Subscription: {
    jobCreated: {
      subscribe: () => pubsub.asyncIterator(['JOB_CREATED']),
    },
  },

  Job: {
    id: (job: any) => job._id.toString(),
    employmentType: (job: any) => {
      return job.employmentType?.replace('-', '_') || job.employmentType;
    },
  },
};

