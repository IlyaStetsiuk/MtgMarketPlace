import { Link } from 'react-router-dom';
import { Auction } from '../../types/api';
import Badge from '../ui/Badge';
import Countdown from '../ui/Countdown';
import { Gavel, Star, Users } from 'lucide-react';

interface Props {
  auction: Auction;
}

const conditionLabel: Record<string, string> = {
  MINT: 'M', NEAR_MINT: 'NM', EXCELLENT: 'EX', GOOD: 'GD', LIGHT_PLAYED: 'LP', PLAYED: 'PL', POOR: 'PR',
};

export default function AuctionCard({ auction }: Props) {
  const isEnded = auction.status !== 'ACTIVE';
  const currentPrice = auction.currentBid ?? auction.startingPrice;
  const bidCount = auction._count?.bids ?? auction.bids?.length ?? 0;

  return (
    <Link to={`/auctions/${auction.id}`}>
      <article className={`card-surface card-hover overflow-hidden group ${!isEnded ? 'auction-glow' : 'opacity-75'}`}>
        <div className="relative aspect-[5/7] overflow-hidden bg-obsidian-dark">
          {auction.imageUri ? (
            <img
              src={auction.imageUri}
              alt={auction.cardName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700">
              <Gavel size={32} />
            </div>
          )}

          {/* Live badge */}
          {!isEnded && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}

          {auction.isFoil && (
            <div className="absolute top-2 right-2">
              <span className="badge-foil">Foil</span>
            </div>
          )}

          {/* Countdown overlay at bottom */}
          {!isEnded && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-obsidian-dark/90 to-transparent p-2">
              <Countdown endsAt={auction.endsAt} className="text-sm font-bold" />
            </div>
          )}
          {isEnded && (
            <div className="absolute inset-0 bg-obsidian-dark/60 flex items-center justify-center">
              <span className="text-slate-400 font-medium border border-slate-600 px-3 py-1 rounded">Ended</span>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <div>
            <p className="font-semibold text-slate-100 truncate text-sm">{auction.cardName}</p>
            <p className="text-xs text-slate-500 truncate">{auction.setName}</p>
          </div>

          <div className="flex items-center justify-between">
            <Badge condition={auction.condition}>{conditionLabel[auction.condition] ?? auction.condition}</Badge>
            <div className="text-right">
              <p className="text-xs text-slate-500">{bidCount > 0 ? 'Current bid' : 'Starting'}</p>
              <p className="text-gold font-bold">${currentPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users size={11} />
              {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-gold fill-gold" />
              @{auction.seller.username}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
