import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi } from '../../api/listings.api';
import { auctionsApi } from '../../api/auctions.api';
import { Link } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Countdown from '../../components/ui/Countdown';
import Button from '../../components/ui/Button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export default function MyListings() {
  const qc = useQueryClient();

  const { data: listings, isLoading: loadL } = useQuery({
    queryKey: ['my-listings'],
    queryFn: listingsApi.getMine,
  });

  const { data: auctions, isLoading: loadA } = useQuery({
    queryKey: ['my-auctions'],
    queryFn: auctionsApi.getMine,
  });

  const deleteListingMut = useMutation({
    mutationFn: listingsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-listings'] }),
  });

  const cancelAuctionMut = useMutation({
    mutationFn: auctionsApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-auctions'] }),
  });

  if (loadL || loadA) return <div className="flex items-center justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-200">Fixed Price Listings</h2>
        <Link to="/create" className="btn-primary text-sm flex items-center gap-1.5">
          <Plus size={14} /> New Listing
        </Link>
      </div>

      {!listings?.length ? (
        <p className="text-slate-500 text-center py-8">No listings yet</p>
      ) : (
        <div className="space-y-2">
          {listings.map(l => (
            <div key={l.id} className="card-surface p-4 flex items-center gap-4">
              <img src={l.imageUri} alt={l.cardName} className="w-10 h-14 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200 truncate">{l.cardName}</p>
                <p className="text-sm text-slate-500">{l.setName}</p>
              </div>
              <Badge condition={l.condition}>{l.condition.replace('_', ' ')}</Badge>
              <p className="text-gold font-bold w-20 text-right">${l.price.toFixed(2)}</p>
              <Badge color={l.status === 'ACTIVE' ? 'green' : 'slate'}>{l.status}</Badge>
              <div className="flex gap-2">
                <Link to={`/listings/${l.id}`} className="btn-ghost p-1"><ExternalLink size={14} /></Link>
                {l.status === 'ACTIVE' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteListingMut.mutate(l.id)}
                    loading={deleteListingMut.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-3">My Auctions</h2>
        {!auctions?.length ? (
          <p className="text-slate-500 text-center py-8">No auctions yet</p>
        ) : (
          <div className="space-y-2">
            {auctions.map(a => (
              <div key={a.id} className="card-surface p-4 flex items-center gap-4">
                <img src={a.imageUri} alt={a.cardName} className="w-10 h-14 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 truncate">{a.cardName}</p>
                  <p className="text-sm text-slate-500">{a.setName}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold">${(a.currentBid ?? a.startingPrice).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{(a._count as { bids: number })?.bids ?? 0} bids</p>
                </div>
                {a.status === 'ACTIVE' ? (
                  <Countdown endsAt={a.endsAt} className="text-sm" />
                ) : (
                  <Badge color={a.status === 'ENDED' ? 'gold' : 'red'}>{a.status}</Badge>
                )}
                <div className="flex gap-2">
                  <Link to={`/auctions/${a.id}`} className="btn-ghost p-1"><ExternalLink size={14} /></Link>
                  {a.status === 'ACTIVE' && (a._count as { bids: number })?.bids === 0 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelAuctionMut.mutate(a.id)}
                      loading={cancelAuctionMut.isPending}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
