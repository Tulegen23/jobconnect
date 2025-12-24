import { Request, Response } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';

export interface IContext {
  req: Request;
  res: Response;
  user?: JWTPayload;
}

export const createContext = async ({
  req,
}: {
  req: Request;
}): Promise<IContext> => {
  let user: JWTPayload | undefined;

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      user = verifyToken(token);
    }
  } catch (error) {
  }

  return {
    req,
    res: req.res!,
    user,
  };
};

