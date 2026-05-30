import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

const CONDITIONS = ['MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'LIGHT_PLAYED', 'PLAYED', 'POOR'] as const;

const createSchema = z.object({
  scryfallId: z.string(),
  cardName: z.string(),
  setCode: z.string(),
  setName: z.string(),
  imageUri: z.string(),
  lang: z.string().default('en'),
  condition: z.enum(CONDITIONS),
  isFoil: z.boolean().default(false),
  description: z.string().optional(),
  startingPrice: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  buyItNowPrice: z.number().positive().optional(),
  endsAt: z.string().datetime(),
  extendMinutes: z.number().int().min(1).max(60).default(5),
});

export async function getAuctions(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, condition, minPrice, maxPrice, setCode, isFoil, status = 'ACTIVE', page = '1', limit = '20', sort = 'ending_soon' } = req.query;

    const where: Record<string, unknown> = { status: String(status) };
    if (q) where.cardName = { contains: String(q) };
    if (condition) where.condition = String(condition);
    if (setCode) where.setCode = String(setCode);
    if (isFoil !== undefined) where.isFoil = isFoil === 'true';
    if (minPrice || maxPrice) {
      where.startingPrice = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    const orderBy =
      sort === 'ending_soon' ? { endsAt: 'asc' as const }
      : sort === 'price_asc' ? { startingPrice: 'asc' as const }
      : sort === 'price_desc' ? { startingPrice: 'desc' as const }
      : { createdAt: 'desc' as const };

    const skip = (Number(page) - 1) * Number(limit);

    const [total, auctions] = await Promise.all([
      prisma.auction.count({ where }),
      prisma.auction.findMany({
        where,
        include: {
          seller: { select: { id: true, username: true, averageRating: true } },
          _count: { select: { bids: true } },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
    ]);

    res.json({ data: auctions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getAuction(req: Request, res: Response, next: NextFunction) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, username: true, averageRating: true, reviewCount: true } },
        bids: {
          include: { bidder: { select: { id: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { bids: true } },
      },
    });
    if (!auction) throw new AppError('Auction not found', 404);
    res.json({ data: auction });
  } catch (err) {
    next(err);
  }
}

export async function createAuction(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const endsAt = new Date(data.endsAt);
    if (endsAt <= new Date()) throw new AppError('End time must be in the future', 400);

    const auction = await prisma.auction.create({
      data: { ...data, endsAt, sellerId: req.user!.id },
      include: { seller: { select: { id: true, username: true, averageRating: true } } },
    });
    res.status(201).json({ data: auction });
  } catch (err) {
    next(err);
  }
}

export async function cancelAuction(req: Request, res: Response, next: NextFunction) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bids: true } } },
    });
    if (!auction) throw new AppError('Auction not found', 404);
    if (auction.sellerId !== req.user!.id) throw new AppError('Forbidden', 403);
    if (auction._count.bids > 0) throw new AppError('Cannot cancel an auction with bids', 400);

    await prisma.auction.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Auction cancelled' });
  } catch (err) {
    next(err);
  }
}

export async function getMyAuctions(req: Request, res: Response, next: NextFunction) {
  try {
    const auctions = await prisma.auction.findMany({
      where: { sellerId: req.user!.id },
      include: { _count: { select: { bids: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: auctions });
  } catch (err) {
    next(err);
  }
}
