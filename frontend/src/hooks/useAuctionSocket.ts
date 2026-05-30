import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auctionId) return;

    const socket = io({ withCredentials: true });

    socket.emit('join:auction', auctionId);

    socket.on('bid:new', (event: BidNewEvent) => {
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
    });

    socket.on('auction:extended', (event: AuctionExtendedEvent) => {
      queryClient.setQueryData<Auction>(['auction', auctionId], (old) => {
        if (!old) return old;
        return { ...old, endsAt: event.endsAt, extensionCount: event.extensionCount };
      });
    });

    socket.on('auction:ended', (event: AuctionEndedEvent) => {
      queryClient.setQueryData<Auction>(['auction', auctionId], (old) => {
        if (!old) return old;
        return { ...old, status: 'ENDED', winnerId: event.winnerId ?? undefined, currentBid: event.finalBid ?? old.currentBid };
      });
    });

    return () => {
      socket.emit('leave:auction', auctionId);
      socket.disconnect();
    };
  }, [auctionId, queryClient]);
}
