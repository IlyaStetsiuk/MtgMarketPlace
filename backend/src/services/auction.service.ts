import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { emitBidNew, emitAuctionExtended } from './socket.service';

export async function placeBid(auctionId: string, bidderId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

    if (!auction) throw new AppError('Auction not found', 404);
    if (auction.status !== 'ACTIVE') throw new AppError('Auction is not active', 400);

    const now = new Date();
    if (now > auction.endsAt) throw new AppError('Auction has already ended', 400);
    if (auction.sellerId === bidderId) throw new AppError('Cannot bid on your own auction', 400);

    const minBid = auction.currentBid != null ? auction.currentBid + 0.01 : auction.startingPrice;
    if (amount < minBid) {
      throw new AppError(
        `Bid must be at least $${minBid.toFixed(2)}`,
        400,
      );
    }

    // Anti-snipe: if bid placed within extendMinutes of end, push end time
    const threshold = new Date(auction.endsAt.getTime() - auction.extendMinutes * 60 * 1000);
    const wasExtended = now >= threshold;
    const newEndsAt = wasExtended
      ? new Date(now.getTime() + auction.extendMinutes * 60 * 1000)
      : auction.endsAt;

    // BIN check
    const buyItNow = auction.buyItNowPrice != null && amount >= auction.buyItNowPrice;
    const newStatus = buyItNow ? 'ENDED' : 'ACTIVE';

    const bid = await tx.bid.create({
      data: { auctionId, bidderId, amount },
      include: {
        bidder: { select: { id: true, username: true } },
      },
    });

    const updated = await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentBid: amount,
        winnerId: buyItNow ? bidderId : undefined,
        endsAt: newEndsAt,
        extensionCount: { increment: wasExtended ? 1 : 0 },
        status: newStatus,
      },
    });

    // Emit outside the transaction (already committed)
    setImmediate(() => {
      emitBidNew(auctionId, {
        bid: {
          id: bid.id,
          auctionId,
          amount,
          bidderId,
          bidder: bid.bidder,
          createdAt: bid.createdAt,
        },
        currentBid: amount,
        endsAt: updated.endsAt,
        status: updated.status,
      });

      if (wasExtended) {
        emitAuctionExtended(auctionId, {
          endsAt: updated.endsAt,
          extensionCount: updated.extensionCount,
        });
      }
    });

    return { bid, auction: updated };
  });
}
