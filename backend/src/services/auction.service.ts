import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';
import { emitBidNew, emitAuctionExtended } from './socket.service';
import { createNotification } from './notification.service';

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
      throw new AppError(`Bid must be at least $${minBid.toFixed(2)}`, 400);
    }

    const prevLeaderId = auction.bids[0]?.bidderId ?? null;

    // Anti-snipe: if bid placed within extendMinutes of end, push end time
    const threshold = new Date(auction.endsAt.getTime() - auction.extendMinutes * 60 * 1000);
    const wasExtended = now >= threshold;
    const newEndsAt = wasExtended
      ? new Date(now.getTime() + auction.extendMinutes * 60 * 1000)
      : auction.endsAt;

    const buyItNow = auction.buyItNowPrice != null && amount >= auction.buyItNowPrice;
    const newStatus = buyItNow ? 'ENDED' : 'ACTIVE';

    const bid = await tx.bid.create({
      data: { auctionId, bidderId, amount },
      include: { bidder: { select: { id: true, username: true } } },
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

    setImmediate(async () => {
      emitBidNew(auctionId, {
        bid: { id: bid.id, auctionId, amount, bidderId, bidder: bid.bidder, createdAt: bid.createdAt },
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

      // Notify the displaced leader they've been outbid
      if (prevLeaderId && prevLeaderId !== bidderId) {
        await createNotification(
          prevLeaderId,
          'outbid',
          "You've been outbid!",
          `Someone placed a $${amount.toFixed(2)} bid on ${auction.cardName}. Bid again to stay in the lead.`,
          `/auctions/${auctionId}`,
        );
      }
    });

    return { bid, auction: updated };
  });
}
