import { Link } from 'react-router-dom';
import { Listing } from '../../types/api';
import Badge from '../ui/Badge';
import { Star, Sparkles } from 'lucide-react';

interface Props {
  listing: Listing;
}

const conditionLabel: Record<string, string> = {
  MINT: 'M', NEAR_MINT: 'NM', EXCELLENT: 'EX', GOOD: 'GD', LIGHT_PLAYED: 'LP', PLAYED: 'PL', POOR: 'PR',
};

export default function ListingCard({ listing }: Props) {
  return (
    <Link to={`/listings/${listing.id}`}>
      <article className="card-surface card-hover overflow-hidden group">
        <div className="relative aspect-[5/7] overflow-hidden bg-obsidian-dark">
          {listing.imageUri ? (
            <img
              src={listing.imageUri}
              alt={listing.cardName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700">
              <Sparkles size={32} />
            </div>
          )}
          {listing.isFoil && (
            <div className="absolute top-2 right-2">
              <span className="badge-foil">Foil</span>
            </div>
          )}
          {listing.quantity > 1 && (
            <div className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded bg-obsidian/80 text-slate-300">
              x{listing.quantity}
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <div>
            <p className="font-semibold text-slate-100 truncate text-sm">{listing.cardName}</p>
            <p className="text-xs text-slate-500 truncate">{listing.setName}</p>
          </div>

          <div className="flex items-center justify-between">
            <Badge condition={listing.condition}>{conditionLabel[listing.condition] ?? listing.condition}</Badge>
            <span className="text-gold font-bold">${listing.price.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Star size={11} className="text-gold fill-gold" />
            <span>{listing.seller.averageRating.toFixed(1)}</span>
            <span className="ml-1 truncate">@{listing.seller.username}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
