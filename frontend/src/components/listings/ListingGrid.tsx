import { Listing } from '../../types/api';
import ListingCard from './ListingCard';
import Spinner from '../ui/Spinner';

interface Props {
  listings: Listing[];
  loading?: boolean;
}

export default function ListingGrid({ listings, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-lg">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
