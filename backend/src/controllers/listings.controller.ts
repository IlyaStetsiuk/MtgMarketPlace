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
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  description: z.string().optional(),
});

export async function getListings(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, condition, minPrice, maxPrice, setCode, isFoil, page = '1', limit = '20', sort = 'newest' } = req.query;

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (q) where.cardName = { contains: String(q) };
    if (condition) where.condition = String(condition);
    if (setCode) where.setCode = String(setCode);
    if (isFoil !== undefined) where.isFoil = isFoil === 'true';
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    const orderBy =
      sort === 'price_asc' ? { price: 'asc' as const }
      : sort === 'price_desc' ? { price: 'desc' as const }
      : { createdAt: 'desc' as const };

    const skip = (Number(page) - 1) * Number(limit);

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: { seller: { select: { id: true, username: true, averageRating: true } } },
        orderBy,
        skip,
        take: Number(limit),
      }),
    ]);

    res.json({ data: listings, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { id: true, username: true, averageRating: true, reviewCount: true } } },
    });
    if (!listing) throw new AppError('Listing not found', 404);
    res.json({ data: listing });
  } catch (err) {
    next(err);
  }
}

export async function createListing(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const listing = await prisma.listing.create({
      data: { ...data, sellerId: req.user!.id },
      include: { seller: { select: { id: true, username: true, averageRating: true } } },
    });
    res.status(201).json({ data: listing });
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) throw new AppError('Listing not found', 404);
    if (listing.sellerId !== req.user!.id) throw new AppError('Forbidden', 403);
    await prisma.listing.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Listing cancelled' });
  } catch (err) {
    next(err);
  }
}

export async function getMyListings(req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: listings });
  } catch (err) {
    next(err);
  }
}
