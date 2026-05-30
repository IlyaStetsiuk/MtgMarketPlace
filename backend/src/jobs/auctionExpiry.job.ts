import { prisma } from '../utils/prisma';
import { emitAuctionEnded } from '../services/socket.service';
import { createNotification } from '../services/notification.service';

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

        if (winnerId) {
          // Notify both parties
          await createNotification(
            winnerId,
            'auction_won',
            '🎉 You won the auction!',
            `You won ${auction.cardName} with a bid of $${auction.currentBid?.toFixed(2)}. Message the seller to arrange shipping.`,
            `/auctions/${auction.id}`,
          );
          await createNotification(
            auction.sellerId,
            'auction_ended',
            'Your auction ended',
            `${auction.cardName} sold for $${auction.currentBid?.toFixed(2)}. Message the buyer to arrange shipping.`,
            `/auctions/${auction.id}`,
          );

          // Auto-create a conversation thread for winner and seller if one doesn't exist
          const existing = await prisma.conversation.findFirst({
            where: {
              auctionId: auction.id,
              OR: [
                { user1Id: auction.sellerId, user2Id: winnerId },
                { user1Id: winnerId, user2Id: auction.sellerId },
              ],
            },
          });
          if (!existing) {
            await prisma.conversation.create({
              data: { user1Id: auction.sellerId, user2Id: winnerId, auctionId: auction.id },
            });
          }
        } else {
          await createNotification(
            auction.sellerId,
            'auction_ended',
            'Auction ended with no bids',
            `Your auction for ${auction.cardName} ended without any bids.`,
            `/auctions/${auction.id}`,
          );
        }
      }
    } catch (err) {
      console.error('[AuctionExpiry]', err);
    }
  }, 30_000);
}
