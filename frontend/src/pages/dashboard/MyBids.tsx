import { useQuery } from '@tanstack/react-query';
import { bidsApi } from '../../api/bids.api';
import { Link } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Countdown from '../../components/ui/Countdown';
import Badge from '../../components/ui/Badge';
import { ExternalLink, Trophy } from 'lucide-react';

export default function MyBids() {
  const { data: bids, isLoading } = useQuery({
    queryKey: ['my-bids'],
    queryFn: bidsApi.getMine,
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Spinner /></div>;

  if (!bids?.length) {
    return <p className="text-slate-500 text-center py-12">You haven't bid on anything yet</p>;
  }

  return (
    <div className="space-y-2">
      {bids.map(bid => {
        const auction = bid.auction;
        if (!auction) return null;

        const isWinning = auction.currentBid === bid.amount;
        const isEnded = auction.status !== 'ACTIVE';
        const wonIt = isEnded && auction.currentBid === bid.amount;

        return (
          <div key={bid.id} className={`card-surface p-4 flex items-center gap-4 ${wonIt ? 'border-gold/40' : ''}`}>
            <img src={auction.imageUri} alt={auction.cardName} className="w-10 h-14 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 truncate">{auction.cardName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-slate-500">Your bid: <span className="text-gold">${bid.amount.toFixed(2)}</span></p>
                {!isEnded && (
                  <p className="text-xs text-slate-600">
                    Current: ${auction.currentBid?.toFixed(2) ?? '—'}
                  </p>
                )}
              </div>
            </div>

            {wonIt && (
              <div className="flex items-center gap-1 text-gold text-sm font-medium">
                <Trophy size={14} /> Won!
              </div>
            )}
            {!isEnded && (
              isWinning
                ? <Badge color="green">Winning</Badge>
                : <Badge color="red">Outbid</Badge>
            )}

            {!isEnded && <Countdown endsAt={auction.endsAt} className="text-sm" />}
            {isEnded && !wonIt && <Badge color="slate">Ended</Badge>}

            <Link to={`/auctions/${auction.id}`} className="btn-ghost p-1">
              <ExternalLink size={14} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
