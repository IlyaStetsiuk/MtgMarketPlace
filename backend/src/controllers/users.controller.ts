import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function getUserListings(req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.params.id, status: 'ACTIVE' },
      include: { seller: { select: { id: true, username: true, averageRating: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: listings });
  } catch (err) {
    next(err);
  }
}

export async function getUserAuctions(req: Request, res: Response, next: NextFunction) {
  try {
    const auctions = await prisma.auction.findMany({
      where: { sellerId: req.params.id, status: 'ACTIVE' },
      include: { seller: { select: { id: true, username: true, averageRating: true } } },
      orderBy: { endsAt: 'asc' },
    });
    res.json({ data: auctions });
  } catch (err) {
    next(err);
  }
}
