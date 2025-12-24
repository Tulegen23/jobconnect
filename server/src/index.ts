import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { connectDB } from './db/connection';
import { config } from './config';
import { typeDefs } from './graphql/types';
import { resolvers } from './graphql/resolvers';
import { createContext } from './graphql/context';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      return createContext({
        req: ctx.extra.request as any,
      });
    },
  },
  wsServer
);

const apolloServer = new ApolloServer({
  schema,
  formatError: (error) => {
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_ERROR',
      path: error.path,
    };
  },
});

const startServer = async () => {
  await connectDB();

  await apolloServer.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: createContext,
    })
  );

  httpServer.listen(config.port, () => {
    console.log(`🚀 Server ready at http://localhost:${config.port}/graphql`);
    console.log(`📡 Subscriptions ready at ws://localhost:${config.port}/graphql`);
  });
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  serverCleanup.dispose();
  await apolloServer.stop();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

