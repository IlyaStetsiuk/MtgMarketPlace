import { Link } from 'react-router-dom';
import { User } from '../../types/api';
import StarRating from '../ui/StarRating';
import { ExternalLink } from 'lucide-react';

interface Props {
  seller: Pick<User, 'id' | 'username' | 'averageRating' | 'reviewCount'>;
  compact?: boolean;
}

export default function SellerRating({ seller, compact }: Props) {
  if (compact) {
    return (
      <Link to={`/sellers/${seller.id}`} className="flex items-center gap-2 hover:text-gold transition-colors group">
        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm">
          {seller.username[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium group-hover:text-gold">@{seller.username}</p>
          <div className="flex items-center gap-1">
            <StarRating value={seller.averageRating} size={12} />
            <span className="text-xs text-slate-500">({seller.reviewCount})</span>
          </div>
        </div>
        <ExternalLink size={12} className="text-slate-600 group-hover:text-gold ml-auto" />
      </Link>
    );
  }

  return (
    <div className="card-surface p-4 space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-wider">Seller</p>
      <Link to={`/sellers/${seller.id}`} className="flex items-center gap-3 hover:text-gold transition-colors group">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
          {seller.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold group-hover:text-gold">@{seller.username}</p>
          <div className="flex items-center gap-1.5">
            <StarRating value={seller.averageRating} size={14} />
            <span className="text-sm text-slate-400">{seller.averageRating.toFixed(1)}</span>
            <span className="text-sm text-slate-600">({seller.reviewCount} reviews)</span>
          </div>
        </div>
        <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-gold" />
      </Link>
    </div>
  );
}
