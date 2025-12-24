import { Job } from '../../models/Job';
import { Company } from '../../models/Company';
import { User } from '../../models/User';
import { jobResolvers } from '../../graphql/resolvers/job';
import { hashPassword } from '../../utils/auth';
import mongoose from 'mongoose';

describe('Job Resolvers', () => {
  let employer: any;
  let company: any;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobconnect-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});

    const password = await hashPassword('password123');
    employer = new User({
      email: 'employer@example.com',
      password,
      firstName: 'Employer',
      lastName: 'User',
      role: 'employer',
    });
    await employer.save();

    company = new Company({
      name: 'Test Company',
      description: 'A leading technology company specializing in innovative software solutions and cutting-edge development practices.',
      industry: 'Technology',
      size: 'medium',
      location: 'New York, USA',
      owner: employer._id,
    });
    await company.save();
  });

  describe('createJob', () => {
    it('should create a job successfully', async () => {
      const context = {
        user: {
          userId: employer._id.toString(),
          email: employer.email,
          role: employer.role,
        },
      };

      const input = {
        title: 'Senior Developer',
        description: 'We are looking for a senior developer with 5+ years of experience in building scalable web applications. The ideal candidate should have strong knowledge of TypeScript, React, and Node.js, with experience in modern development practices and agile methodologies.',
        requirements: ['5+ years of experience', 'Strong knowledge of TypeScript'],
        employmentType: 'full-time' as const,
        location: 'New York, USA',
        remote: false,
        currency: 'USD',
        category: 'Software Development',
        experienceLevel: 'senior' as const,
        skills: ['TypeScript', 'React', 'Node.js'],
      };

      const result = await jobResolvers.Mutation.createJob(null, { input }, context as any);

      expect(result.title).toBe(input.title);
      expect(result.status).toBe('draft');
      expect(result.company).toBeDefined();
    });

    it('should throw error if user is not employer', async () => {
      const context = {
        user: {
          userId: 'some-id',
          email: 'candidate@example.com',
          role: 'candidate',
        },
      };

      const input = {
        title: 'Senior Developer',
        description: 'We are looking for a senior developer.',
        requirements: ['5+ years of experience'],
        employmentType: 'full-time' as const,
        location: 'New York, USA',
        remote: false,
        currency: 'USD',
        category: 'Software Development',
        experienceLevel: 'senior' as const,
        skills: ['TypeScript'],
      };

      await expect(
        jobResolvers.Mutation.createJob(null, { input }, context as any)
      ).rejects.toThrow('Only employers can create jobs');
    });
  });

  describe('jobs query', () => {
    it('should return published jobs', async () => {
      const job1 = new Job({
        title: 'Job 1',
        description: 'We are looking for an experienced developer with strong skills in React and modern web development. The ideal candidate should have 3+ years of experience building scalable applications and working in agile teams.',
        requirements: ['Req 1'],
        employmentType: 'full-time',
        location: 'New York',
        status: 'published',
        company: company._id,
        category: 'Tech',
        experienceLevel: 'senior',
        skills: ['React'],
      });
      await job1.save();

      const job2 = new Job({
        title: 'Job 2',
        description: 'We are looking for an experienced developer with strong skills in React and modern web development. The ideal candidate should have 3+ years of experience building scalable applications and working in agile teams.',
        requirements: ['Req 2'],
        employmentType: 'full-time',
        location: 'Boston',
        status: 'draft',
        company: company._id,
        category: 'Tech',
        experienceLevel: 'middle',
        skills: ['Vue'],
      });
      await job2.save();

      const result = await jobResolvers.Query.jobs(null, {});

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Job 1');
    });
  });
});

