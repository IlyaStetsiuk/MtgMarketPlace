import { prisma } from '../utils/prisma';
import { emitAuctionEnded } from '../services/socket.service';

export function startAuctionExpiryJob() {
  setInterval(async () => {
    try {
      const expired = await prisma.auction.findMany({
        where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
        include: {
          bids: { orderBy: { amount: 'desc' }, take: 1 },
        },
      });

      for (const auction of expired) {
        const winnerId = auction.bids[0]?.bidderId ?? null;

        await prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'ENDED', winnerId: winnerId ?? undefined },
        });

        emitAuctionEnded(auction.id, {
          auctionId: auction.id,
          winnerId,
          finalBid: auction.currentBid,
        });
      }
    } catch (err) {
      console.error('[AuctionExpiry]', err);
    }
  }, 30_000);
}
