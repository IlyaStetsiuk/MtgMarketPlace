import { Bid } from '../../types/api';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface Props {
  bids: Bid[];
  total?: number;
}

export default function BidHistory({ bids, total }: Props) {
  if (!bids.length) {
    return (
      <div className="card-surface p-4 text-center text-slate-500 text-sm">
        No bids yet — be the first!
      </div>
    );
  }

  return (
    <div className="card-surface p-4 space-y-3">
      <h3 className="font-semibold text-slate-200 flex items-center gap-2">
        <TrendingUp size={16} className="text-gold" />
        Bid History
        {total !== undefined && <span className="text-slate-500 text-sm font-normal">({total} total)</span>}
      </h3>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {bids.map((bid, i) => (
          <div
            key={bid.id}
            className={`flex items-center justify-between py-1.5 px-2 rounded text-sm ${i === 0 ? 'bg-gold/10 border border-gold/20' : 'hover:bg-obsidian-dark/50'}`}
          >
            <span className={`font-medium ${i === 0 ? 'text-gold' : 'text-slate-300'}`}>
              @{bid.bidder.username}
            </span>
            <div className="text-right">
              <span className={`font-bold ${i === 0 ? 'text-gold' : 'text-slate-200'}`}>
                ${bid.amount.toFixed(2)}
              </span>
              <p className="text-xs text-slate-600">
                {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
