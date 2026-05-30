import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { hashPassword, verifyPassword, signToken } from '../services/auth.service';
import { AppError } from '../utils/errors';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) throw new AppError('Email or username already taken', 409);

    const user = await prisma.user.create({
      data: { email, username, passwordHash: await hashPassword(password) },
      select: { id: true, email: true, username: true, averageRating: true, reviewCount: true, createdAt: true },
    });

    const token = signToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);

    const { passwordHash: _, ...safe } = user;
    res.json({ data: safe });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    res.json({ data: req.user });
  } catch (err) {
    next(err);
  }
}
