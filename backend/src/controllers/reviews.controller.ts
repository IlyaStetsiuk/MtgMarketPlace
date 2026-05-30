import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const createSchema = z.object({
  targetId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: req.params.userId },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetId, rating, comment } = createSchema.parse(req.body);
    const authorId = req.user!.id;

    if (authorId === targetId) throw new AppError('Cannot review yourself', 400);

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.upsert({
        where: { authorId_targetId: { authorId, targetId } },
        create: { authorId, targetId, rating, comment },
        update: { rating, comment },
        include: { author: { select: { id: true, username: true } } },
      });

      // Recalculate average
      const agg = await tx.review.aggregate({
        where: { targetId },
        _avg: { rating: true },
        _count: true,
      });

      await tx.user.update({
        where: { id: targetId },
        data: {
          averageRating: agg._avg.rating ?? 0,
          reviewCount: agg._count,
        },
      });

      return created;
    });

    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
}
