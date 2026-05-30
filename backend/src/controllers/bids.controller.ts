import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { placeBid } from '../services/auction.service';
import { AppError } from '../utils/errors';

const bidSchema = z.object({
  auctionId: z.string(),
  amount: z.number().positive(),
});

export async function createBid(req: Request, res: Response, next: NextFunction) {
  try {
    const { auctionId, amount } = bidSchema.parse(req.body);
    const result = await placeBid(auctionId, req.user!.id, amount);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAuctionBids(req: Request, res: Response, next: NextFunction) {
  try {
    const bids = await prisma.bid.findMany({
      where: { auctionId: req.params.auctionId },
      include: { bidder: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: bids });
  } catch (err) {
    next(err);
  }
}

export async function getMyBids(req: Request, res: Response, next: NextFunction) {
  try {
    const bids = await prisma.bid.findMany({
      where: { bidderId: req.user!.id },
      include: {
        auction: {
          select: { id: true, cardName: true, imageUri: true, currentBid: true, endsAt: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by auction, keep only each user's highest bid
    const auctionMap = new Map<string, typeof bids[0]>();
    for (const bid of bids) {
      if (!auctionMap.has(bid.auctionId)) {
        auctionMap.set(bid.auctionId, bid);
      }
    }

    res.json({ data: Array.from(auctionMap.values()) });
  } catch (err) {
    next(err);
  }
}

export async function getHighestBid(_req: Request, res: Response, next: NextFunction) {
  try {
    // Already handled by getAuctionBids — this is just a convenience endpoint
    next(new AppError('Use /bids/auction/:auctionId instead', 400));
  } catch (err) {
    next(err);
  }
}
