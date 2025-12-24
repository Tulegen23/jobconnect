import { IContext } from '../context';
import { userResolvers } from './user';
import { companyResolvers } from './company';
import { jobResolvers } from './job';
import { applicationResolvers } from './application';
import { authResolvers } from './auth';
export { pubsub } from './pubsub';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...companyResolvers.Query,
    ...jobResolvers.Query,
    ...applicationResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...companyResolvers.Mutation,
    ...jobResolvers.Mutation,
    ...applicationResolvers.Mutation,
  },
  Subscription: {
    ...jobResolvers.Subscription,
    ...applicationResolvers.Subscription,
  },
  User: userResolvers.User,
  Company: companyResolvers.Company,
  Job: jobResolvers.Job,
  Application: applicationResolvers.Application,
};

