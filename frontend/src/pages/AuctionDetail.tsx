import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { auctionsApi } from '../api/auctions.api';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Countdown from '../components/ui/Countdown';
import BidForm from '../components/auctions/BidForm';
import BidHistory from '../components/auctions/BidHistory';
import SellerRating from '../components/reviews/SellerRating';
import { Sparkles, ChevronLeft, Globe, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const CONDITION_LABELS: Record<string, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excellent', GOOD: 'Good',
  LIGHT_PLAYED: 'Light Played', PLAYED: 'Played', POOR: 'Poor',
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: auction, isLoading, error } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionsApi.getOne(id!),
    enabled: !!id,
  });

  useAuctionSocket(id);

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size={40} /></div>;
  if (error || !auction) return <div className="text-center py-32 text-slate-500">Auction not found</div>;

  const isActive = auction.status === 'ACTIVE';
  const currentPrice = auction.currentBid ?? auction.startingPrice;
  const bidCount = auction._count?.bids ?? auction.bids?.length ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/browse?tab=auctions" className="flex items-center gap-1 text-slate-500 hover:text-gold text-sm mb-6">
        <ChevronLeft size={14} /> Back to Auctions
      </Link>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Card image */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden aspect-[5/7] bg-obsidian border border-slate-700 relative">
            {auction.imageUri ? (
              <img src={auction.imageUri} alt={auction.cardName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <Sparkles size={48} />
              </div>
            )}
            {isActive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          {/* Timer card */}
          <div className={`card-surface p-4 text-center ${isActive ? 'border-gold/30' : ''}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Clock size={12} />
              {isActive ? 'Time remaining' : 'Auction ended'}
            </p>
            {isActive ? (
              <Countdown endsAt={auction.endsAt} className="text-2xl font-bold" />
            ) : (
              <p className="text-slate-400 font-medium">
                Ended {format(new Date(auction.endsAt), 'MMM d, yyyy')}
              </p>
            )}
            {auction.extensionCount > 0 && (
              <p className="text-xs text-gold/70 mt-1">
                Extended {auction.extensionCount}× (anti-snipe)
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-100">{auction.cardName}</h1>
                <p className="text-slate-400 mt-1">{auction.setName} <span className="text-slate-600">({auction.setCode.toUpperCase()})</span></p>
              </div>
            </div>
          </div>

          {/* Price info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-surface p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">{bidCount > 0 ? 'Current Bid' : 'Starting'}</p>
              <p className="text-xl font-bold text-gold">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="card-surface p-3 text-center">
              <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
                <TrendingUp size={10} /> Bids
              </p>
              <p className="text-xl font-bold text-slate-200">{bidCount}</p>
            </div>
            <div className="card-surface p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Starting</p>
              <p className="text-xl font-bold text-slate-400">${auction.startingPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge condition={auction.condition}>{CONDITION_LABELS[auction.condition] ?? auction.condition}</Badge>
            {auction.isFoil && <span className="badge-foil">Foil</span>}
            <span className="flex items-center gap-1 text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
              <Globe size={11} /> {auction.lang.toUpperCase()}
            </span>
          </div>

          {/* Anti-snipe notice */}
          {isActive && auction.extendMinutes > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/15 rounded-lg p-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                Anti-snipe protection active: bids placed in the last <strong>{auction.extendMinutes} minutes</strong> will extend the auction timer.
              </span>
            </div>
          )}

          {auction.description && (
            <div className="card-surface p-4">
              <p className="text-sm text-slate-400 leading-relaxed">{auction.description}</p>
            </div>
          )}

          {/* Bid form */}
          <BidForm auction={auction} />

          <SellerRating seller={auction.seller} />

          {/* Bid history */}
          <BidHistory
            bids={auction.bids ?? []}
            total={auction._count?.bids}
          />
        </div>
      </div>
    </div>
  );
}
