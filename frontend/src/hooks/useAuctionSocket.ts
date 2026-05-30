import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../context/SocketContext';
import { Auction, Bid } from '../types/api';

interface BidNewEvent {
  bid: Bid;
  currentBid: number;
  endsAt: string;
  status: string;
}

interface AuctionEndedEvent {
  auctionId: string;
  winnerId: string | null;
  finalBid: number | null;
}

interface AuctionExtendedEvent {
  endsAt: string;
  extensionCount: number;
}

export function useAuctionSocket(auctionId: string | undefined) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auctionId || !socket) return;

    socket.emit('join:auction', auctionId);

    const onBidNew = (event: BidNewEvent) => {
      queryClient.setQueryData<Auction>(['auction', auctionId], (old) => {
        if (!old) return old;
        return {
          ...old,
          currentBid: event.currentBid,
          endsAt: event.endsAt,
          status: event.status as Auction['status'],
          bids: [event.bid, ...(old.bids ?? [])],
          _count: { bids: (old._count?.bids ?? 0) + 1 },
        };
      });
    };

    const onExtended = (event: AuctionExtendedEvent) => {
      queryClient.setQueryData<Auction>(['auction', auctionId], (old) => {
        if (!old) return old;
        return { ...old, endsAt: event.endsAt, extensionCount: event.extensionCount };
      });
    };

    const onEnded = (event: AuctionEndedEvent) => {
      queryClient.setQueryData<Auction>(['auction', auctionId], (old) => {
        if (!old) return old;
        return { ...old, status: 'ENDED', winnerId: event.winnerId ?? undefined, currentBid: event.finalBid ?? old.currentBid };
      });
    };

    socket.on('bid:new', onBidNew);
    socket.on('auction:extended', onExtended);
    socket.on('auction:ended', onEnded);

    return () => {
      socket.emit('leave:auction', auctionId);
      socket.off('bid:new', onBidNew);
      socket.off('auction:extended', onExtended);
      socket.off('auction:ended', onEnded);
    };
  }, [auctionId, socket, queryClient]);
}
