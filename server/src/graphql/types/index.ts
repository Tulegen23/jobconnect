import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    phone: String
    avatar: String
    bio: String
    skills: [String!]!
    experience: Int
    location: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Company {
    id: ID!
    name: String!
    description: String!
    website: String
    logo: String
    industry: String!
    size: CompanySize!
    location: String!
    foundedYear: Int
    owner: User!
    employees: [User!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    requirements: [String!]!
    salaryMin: Int
    salaryMax: Int
    currency: String!
    employmentType: EmploymentType!
    location: String!
    remote: Boolean!
    status: JobStatus!
    company: Company!
    category: String!
    experienceLevel: ExperienceLevel!
    skills: [String!]!
    applicationsCount: Int!
    viewsCount: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Application {
    id: ID!
    job: Job!
    candidate: User!
    coverLetter: String!
    status: ApplicationStatus!
    resume: String
    notes: String
    reviewedBy: User
    reviewedAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  enum UserRole {
    candidate
    employer
  }

  enum CompanySize {
    startup
    small
    medium
    large
    enterprise
  }

  enum EmploymentType {
    full_time
    part_time
    contract
    internship
  }

  enum JobStatus {
    draft
    published
    closed
  }

  enum ExperienceLevel {
    junior
    middle
    senior
    lead
  }

  enum ApplicationStatus {
    pending
    reviewed
    interview
    rejected
    accepted
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateCompanyInput {
    name: String!
    description: String!
    website: String
    industry: String!
    size: CompanySize!
    location: String!
    foundedYear: Int
  }

  input UpdateCompanyInput {
    name: String
    description: String
    website: String
    industry: String
    size: CompanySize
    location: String
    foundedYear: Int
  }

  input CreateJobInput {
    title: String!
    description: String!
    requirements: [String!]!
    salaryMin: Int
    salaryMax: Int
    currency: String
    employmentType: EmploymentType!
    location: String!
    remote: Boolean
    category: String!
    experienceLevel: ExperienceLevel!
    skills: [String!]!
  }

  input UpdateJobInput {
    title: String
    description: String
    requirements: [String!]
    salaryMin: Int
    salaryMax: Int
    currency: String
    employmentType: EmploymentType
    location: String
    remote: Boolean
    status: JobStatus
    category: String
    experienceLevel: ExperienceLevel
    skills: [String!]
  }

  input CreateApplicationInput {
    jobId: ID!
    coverLetter: String!
    resume: String
  }

  input UpdateApplicationInput {
    status: ApplicationStatus
    notes: String
  }

  input JobFilters {
    category: String
    location: String
    remote: Boolean
    employmentType: EmploymentType
    experienceLevel: ExperienceLevel
    salaryMin: Int
    skills: [String!]
    search: String
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(role: UserRole, limit: Int, offset: Int): [User!]!

    # Company queries
    company(id: ID!): Company
    companies(limit: Int, offset: Int): [Company!]!
    myCompany: Company

    # Job queries
    job(id: ID!): Job
    jobs(filters: JobFilters, limit: Int, offset: Int): [Job!]!
    myJobs(status: JobStatus, limit: Int, offset: Int): [Job!]!

    # Application queries
    application(id: ID!): Application
    myApplications(status: ApplicationStatus, limit: Int, offset: Int): [Application!]!
    jobApplications(jobId: ID!, status: ApplicationStatus, limit: Int, offset: Int): [Application!]!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Company mutations
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!

    # Job mutations
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
    deleteJob(id: ID!): Boolean!
    publishJob(id: ID!): Job!

    # Application mutations
    createApplication(input: CreateApplicationInput!): Application!
    updateApplication(id: ID!, input: UpdateApplicationInput!): Application!
    deleteApplication(id: ID!): Boolean!
  }

  type Subscription {
    jobCreated: Job!
    applicationCreated: Application!
    applicationStatusChanged: Application!
  }
`;

