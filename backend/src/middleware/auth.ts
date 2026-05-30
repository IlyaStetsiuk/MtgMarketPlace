import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token ?? req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Not authenticated', 401);

    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new AppError('User not found', 401);
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid or expired token', 401));
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, () => next());
}
