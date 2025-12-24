import mongoose from 'mongoose';
import { User } from '../../models/User';
import { Company } from '../../models/Company';
import { Job } from '../../models/Job';
import { Application } from '../../models/Application';
import { hashPassword } from '../../utils/auth';

describe('Integration Tests', () => {
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
  });

  it('should create complete workflow: user -> company -> job -> application', async () => {
    const employerPassword = await hashPassword('password123');
    const employer = new User({
      email: 'employer@example.com',
      password: employerPassword,
      firstName: 'John',
      lastName: 'Employer',
      role: 'employer',
    });
    await employer.save();

    const company = new Company({
      name: 'Tech Corp',
      description: 'A leading technology company specializing in innovative software solutions and cutting-edge development practices.',
      industry: 'Technology',
      size: 'large',
      location: 'San Francisco, USA',
      owner: employer._id,
    });
    await company.save();

    const job = new Job({
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer with strong TypeScript skills and 5+ years of experience in building scalable web applications using React and Node.js.',
      requirements: ['5+ years of experience', 'Strong TypeScript skills'],
      employmentType: 'full-time',
      location: 'San Francisco, USA',
      status: 'published',
      company: company._id,
      category: 'Software Development',
      experienceLevel: 'senior',
      skills: ['TypeScript', 'React', 'Node.js'],
    });
    await job.save();

    const candidatePassword = await hashPassword('password123');
    const candidate = new User({
      email: 'candidate@example.com',
      password: candidatePassword,
      firstName: 'Jane',
      lastName: 'Candidate',
      role: 'candidate',
    });
    await candidate.save();

    const application = new Application({
      job: job._id,
      candidate: candidate._id,
      coverLetter: 'I am very interested in this position and believe I have the skills and experience required to excel in this role. I have extensive experience with TypeScript, React, and Node.js.',
      status: 'pending',
    });
    await application.save();

    const savedApplication = await Application.findById(application._id)
      .populate('job')
      .populate('candidate');

    expect(savedApplication).toBeDefined();
    expect(savedApplication?.job).toBeDefined();
    expect(savedApplication?.candidate).toBeDefined();
    expect((savedApplication?.job as any).company.toString()).toBe(company._id.toString());
    expect((savedApplication?.candidate as any).email).toBe('candidate@example.com');
  });

  it('should handle soft delete correctly', async () => {
    const password = await hashPassword('password123');
    const user = new User({
      email: 'test@example.com',
      password,
      firstName: 'Test',
      lastName: 'User',
      role: 'candidate',
    });
    await user.save();

    user.isDeleted = true;
    await user.save();

    const found = await User.findOne({ email: 'test@example.com', isDeleted: false });
    expect(found).toBeNull();

    const deleted = await User.findOne({ email: 'test@example.com', isDeleted: true });
    expect(deleted).toBeDefined();
  });
});

