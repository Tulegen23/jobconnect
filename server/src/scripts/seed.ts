import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { hashPassword } from '../utils/auth';

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    const employerPassword = await hashPassword('employer123');
    const candidatePassword = await hashPassword('candidate123');

    const employer1 = new User({
      email: 'employer1@example.com',
      password: employerPassword,
      firstName: 'John',
      lastName: 'Employer',
      role: 'employer',
      phone: '+1234567890',
      location: 'New York, USA',
    });

    const employer2 = new User({
      email: 'employer2@example.com',
      password: employerPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      role: 'employer',
      phone: '+1234567891',
      location: 'San Francisco, USA',
    });

    const candidate1 = new User({
      email: 'candidate1@example.com',
      password: candidatePassword,
      firstName: 'Alice',
      lastName: 'Developer',
      role: 'candidate',
      phone: '+1234567892',
      location: 'Boston, USA',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 3,
      bio: 'Experienced full-stack developer',
    });

    const candidate2 = new User({
      email: 'candidate2@example.com',
      password: candidatePassword,
      firstName: 'Bob',
      lastName: 'Engineer',
      role: 'candidate',
      phone: '+1234567893',
      location: 'Seattle, USA',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: 5,
      bio: 'Senior backend engineer',
    });

    await employer1.save();
    await employer2.save();
    await candidate1.save();
    await candidate2.save();
    console.log('Created users');

    const company1 = new Company({
      name: 'TechCorp Inc.',
      description:
        'A leading technology company specializing in software development and innovation. We build cutting-edge solutions for businesses worldwide.',
      website: 'https://techcorp.example.com',
      industry: 'Technology',
      size: 'large',
      location: 'New York, USA',
      foundedYear: 2010,
      owner: employer1._id,
    });

    const company2 = new Company({
      name: 'StartupHub',
      description:
        'A fast-growing startup focused on creating innovative products. We value creativity, collaboration, and cutting-edge technology.',
      website: 'https://startuphub.example.com',
      industry: 'Software',
      size: 'startup',
      location: 'San Francisco, USA',
      foundedYear: 2020,
      owner: employer2._id,
    });

    await company1.save();
    await company2.save();
    console.log('Created companies');

    const job1 = new Job({
      title: 'Senior Full-Stack Developer',
      description:
        'We are looking for an experienced full-stack developer to join our team. You will work on building scalable web applications using modern technologies. Responsibilities include designing and implementing new features, optimizing performance, and collaborating with cross-functional teams.',
      requirements: [
        '5+ years of experience in full-stack development',
        'Strong knowledge of React and Node.js',
        'Experience with TypeScript',
        'Understanding of RESTful APIs and GraphQL',
        'Familiarity with cloud platforms (AWS, Azure)',
      ],
      salaryMin: 100000,
      salaryMax: 150000,
      currency: 'USD',
      employmentType: 'full-time',
      location: 'New York, USA',
      remote: true,
      status: 'published',
      company: company1._id,
      category: 'Software Development',
      experienceLevel: 'senior',
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'AWS'],
    });

    const job2 = new Job({
      title: 'React Developer',
      description:
        'Join our frontend team to build amazing user experiences. You will work with React, TypeScript, and modern frontend tools to create responsive and accessible web applications.',
      requirements: [
        '3+ years of React experience',
        'Proficiency in TypeScript',
        'Knowledge of state management (Redux, Zustand)',
        'Experience with testing frameworks',
        'Understanding of responsive design',
      ],
      salaryMin: 80000,
      salaryMax: 120000,
      currency: 'USD',
      employmentType: 'full-time',
      location: 'San Francisco, USA',
      remote: false,
      status: 'published',
      company: company2._id,
      category: 'Frontend Development',
      experienceLevel: 'middle',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Jest'],
    });

    const job3 = new Job({
      title: 'Backend Developer (Node.js)',
      description:
        'We need a skilled backend developer to help us build robust APIs and microservices. You will work with Node.js, Express, and MongoDB to create scalable backend solutions.',
      requirements: [
        '4+ years of Node.js experience',
        'Strong knowledge of Express.js',
        'Experience with MongoDB and Mongoose',
        'Understanding of GraphQL',
        'Knowledge of Docker and containerization',
      ],
      salaryMin: 90000,
      salaryMax: 130000,
      currency: 'USD',
      employmentType: 'full-time',
      location: 'Remote',
      remote: true,
      status: 'published',
      company: company1._id,
      category: 'Backend Development',
      experienceLevel: 'middle',
      skills: ['Node.js', 'Express', 'MongoDB', 'GraphQL', 'Docker'],
    });

    await job1.save();
    await job2.save();
    await job3.save();
    console.log('Created jobs');

    const application1 = new Application({
      job: job1._id,
      candidate: candidate1._id,
      coverLetter:
        'I am very interested in this position. With my 3 years of experience in React and Node.js, I believe I can contribute significantly to your team. I have worked on several full-stack projects and am passionate about building scalable applications.',
      status: 'pending',
    });

    const application2 = new Application({
      job: job2._id,
      candidate: candidate1._id,
      coverLetter:
        'I am excited about the opportunity to work as a React Developer. I have extensive experience with React and TypeScript, and I am always eager to learn new technologies and best practices.',
      status: 'reviewed',
    });

    const application3 = new Application({
      job: job3._id,
      candidate: candidate2._id,
      coverLetter:
        'As a senior backend engineer with 5 years of experience, I am confident that I can help your team build robust and scalable backend solutions. I have extensive experience with Node.js, Express, and MongoDB.',
      status: 'interview',
    });

    await application1.save();
    await application2.save();
    await application3.save();

    await Job.findByIdAndUpdate(job1._id, { $inc: { applicationsCount: 1 } });
    await Job.findByIdAndUpdate(job2._id, { $inc: { applicationsCount: 1 } });
    await Job.findByIdAndUpdate(job3._id, { $inc: { applicationsCount: 1 } });

    console.log('Created applications');
    console.log('✅ Seeding completed successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();

