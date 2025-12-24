import { z } from 'zod';
import { Application } from '../../models/Application';
import { Job } from '../../models/Job';
import { Company } from '../../models/Company';
import { IContext } from '../context';
import { pubsub } from './pubsub';

const createApplicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(50).max(2000),
  resume: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'interview', 'rejected', 'accepted']).optional(),
  notes: z.string().max(1000).optional(),
});

export const applicationResolvers = {
  Query: {
    application: async (_: unknown, args: { id: string }, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const application = await Application.findById(args.id)
        .populate('job')
        .populate('candidate')
        .populate('reviewedBy')
        .lean();

      if (!application || application.isDeleted) {
        throw new Error('Application not found');
      }

      if (context.user.role === 'candidate') {
        if (application.candidate.toString() !== context.user.userId) {
          throw new Error('Unauthorized');
        }
      } else {
        const job = await Job.findById(application.job);
        if (job) {
          const company = await Company.findById(job.company);
          if (company && company.owner.toString() !== context.user.userId) {
            throw new Error('Unauthorized');
          }
        }
      }

      return application;
    },

    myApplications: async (
      _: unknown,
      args: { status?: string; limit?: number; offset?: number },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'candidate') {
        throw new Error('Only candidates can view their applications');
      }

      const query: any = {
        candidate: context.user.userId,
        isDeleted: false,
      };

      if (args.status) {
        query.status = args.status;
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return Application.find(query)
        .populate('job')
        .populate('candidate')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    },

    jobApplications: async (
      _: unknown,
      args: { jobId: string; status?: string; limit?: number; offset?: number },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can view job applications');
      }

      const job = await Job.findById(args.jobId);
      if (!job || job.isDeleted) {
        throw new Error('Job not found');
      }

      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== context.user.userId) {
        throw new Error('Unauthorized');
      }

      const query: any = {
        job: args.jobId,
        isDeleted: false,
      };

      if (args.status) {
        query.status = args.status;
      }

      const limit = args.limit || 20;
      const offset = args.offset || 0;

      return Application.find(query)
        .populate('job')
        .populate('candidate')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();
    },
  },

  Mutation: {
    createApplication: async (
      _: unknown,
      args: { input: z.infer<typeof createApplicationSchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'candidate') {
        throw new Error('Only candidates can create applications');
      }

      const validated = createApplicationSchema.parse(args.input);

      const job = await Job.findById(validated.jobId);
      if (!job || job.isDeleted || job.status !== 'published') {
        throw new Error('Job not found or not available');
      }

      const existingApplication = await Application.findOne({
        job: validated.jobId,
        candidate: context.user.userId,
        isDeleted: false,
      });

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      const application = new Application({
        job: validated.jobId,
        candidate: context.user.userId,
        coverLetter: validated.coverLetter,
        resume: validated.resume,
        status: 'pending',
      });

      await application.save();

      await Job.findByIdAndUpdate(validated.jobId, {
        $inc: { applicationsCount: 1 },
      });

      await application.populate('job');
      await application.populate('candidate');

      pubsub.publish('APPLICATION_CREATED', {
        applicationCreated: application.toObject(),
      });

      return application.toObject();
    },

    updateApplication: async (
      _: unknown,
      args: { id: string; input: z.infer<typeof updateApplicationSchema> },
      context: IContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
      if (context.user.role !== 'employer') {
        throw new Error('Only employers can update applications');
      }

      const validated = updateApplicationSchema.parse(args.input);
      const application = await Application.findById(args.id).populate('job');

      if (!application || application.isDeleted) {
        throw new Error('Application not found');
      }

      const job = await Job.findById(application.job);
      if (!job) {
        throw new Error('Job not found');
      }

      const company = await Company.findById(job.company);
      if (!company || company.owner.toString() !== context.user.userId) {
        throw new Error('Unauthorized');
      }

      if (validated.status) {
        application.status = validated.status as any;
        application.reviewedBy = context.user.userId as any;
        application.reviewedAt = new Date();
      }

      if (validated.notes !== undefined) {
        application.notes = validated.notes;
      }

      await application.save();
      await application.populate('candidate');
      await application.populate('reviewedBy');

      pubsub.publish('APPLICATION_STATUS_CHANGED', {
        applicationStatusChanged: application.toObject(),
      });

      return application.toObject();
    },

    deleteApplication: async (_: unknown, args: { id: string }, context: IContext) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }

      const application = await Application.findById(args.id);
      if (!application || application.isDeleted) {
        throw new Error('Application not found');
      }

      if (context.user.role === 'candidate') {
        if (application.candidate.toString() !== context.user.userId) {
          throw new Error('Unauthorized');
        }
      } else {
        const job = await Job.findById(application.job);
        if (job) {
          const company = await Company.findById(job.company);
          if (!company || company.owner.toString() !== context.user.userId) {
            throw new Error('Unauthorized');
          }
        }
      }

      application.isDeleted = true;
      await application.save();

      return true;
    },
  },

  Subscription: {
    applicationCreated: {
      subscribe: () => pubsub.asyncIterator(['APPLICATION_CREATED']),
    },
    applicationStatusChanged: {
      subscribe: () => pubsub.asyncIterator(['APPLICATION_STATUS_CHANGED']),
    },
  },

  Application: {
    id: (application: any) => application._id.toString(),
  },
};

