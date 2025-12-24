import { Application } from '../../models/Application';
import { Job } from '../../models/Job';
import { Company } from '../../models/Company';
import { User } from '../../models/User';
import { applicationResolvers } from '../../graphql/resolvers/application';
import { hashPassword } from '../../utils/auth';
import mongoose from 'mongoose';

describe('Application Resolvers', () => {
  let employer: any;
  let candidate: any;
  let company: any;
  let job: any;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobconnect-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    const password = await hashPassword('password123');

    employer = new User({
      email: 'employer@example.com',
      password,
      firstName: 'Employer',
      lastName: 'User',
      role: 'employer',
    });
    await employer.save();

    candidate = new User({
      email: 'candidate@example.com',
      password,
      firstName: 'Candidate',
      lastName: 'User',
      role: 'candidate',
    });
    await candidate.save();

    company = new Company({
      name: 'Test Company',
      description: 'A leading technology company specializing in innovative software solutions and cutting-edge development practices.',
      industry: 'Technology',
      size: 'medium',
      location: 'New York, USA',
      owner: employer._id,
    });
    await company.save();

    job = new Job({
      title: 'Senior Developer',
      description: 'We are looking for a senior developer with 5+ years of experience in building scalable web applications. The ideal candidate should have strong knowledge of TypeScript, React, and Node.js, with experience in modern development practices.',
      requirements: ['5+ years of experience'],
      employmentType: 'full-time',
      location: 'New York, USA',
      status: 'published',
      company: company._id,
      category: 'Software Development',
      experienceLevel: 'senior',
      skills: ['TypeScript'],
    });
    await job.save();
  });

  describe('createApplication', () => {
    it('should create an application successfully', async () => {
      const context = {
        user: {
          userId: candidate._id.toString(),
          email: candidate.email,
          role: candidate.role,
        },
      };

      const input = {
        jobId: job._id.toString(),
        coverLetter: 'I am very interested in this position and believe I have the skills required.',
      };

      const result = await applicationResolvers.Mutation.createApplication(
        null,
        { input },
        context as any
      );

      expect(result.status).toBe('pending');
      expect(result.job).toBeDefined();
    });

    it('should throw error if user is not candidate', async () => {
      const context = {
        user: {
          userId: employer._id.toString(),
          email: employer.email,
          role: employer.role,
        },
      };

      const input = {
        jobId: job._id.toString(),
        coverLetter: 'I am interested.',
      };

      await expect(
        applicationResolvers.Mutation.createApplication(null, { input }, context as any)
      ).rejects.toThrow('Only candidates can create applications');
    });

    it('should throw error if already applied', async () => {
      const context = {
        user: {
          userId: candidate._id.toString(),
          email: candidate.email,
          role: candidate.role,
        },
      };

      const input = {
        jobId: job._id.toString(),
        coverLetter: 'I am interested.',
      };

      await applicationResolvers.Mutation.createApplication(null, { input }, context as any);

      await expect(
        applicationResolvers.Mutation.createApplication(null, { input }, context as any)
      ).rejects.toThrow('You have already applied to this job');
    });
  });
});

