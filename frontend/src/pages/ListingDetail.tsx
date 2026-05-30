import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listingsApi } from '../api/listings.api';
import { messagesApi } from '../api/messages.api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import SellerRating from '../components/reviews/SellerRating';
import { Sparkles, ChevronLeft, Globe, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';

const CONDITION_LABELS: Record<string, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excellent', GOOD: 'Good',
  LIGHT_PLAYED: 'Light Played', PLAYED: 'Played', POOR: 'Poor',
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getOne(id!),
    enabled: !!id,
  });

  const contactMutation = useMutation({
    mutationFn: () =>
      messagesApi.startConversation({ otherUserId: listing!.sellerId, listingId: id }),
    onSuccess: (conv) => navigate(`/messages/${conv.id}`),
  });

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size={40} /></div>;
  if (error || !listing) return <div className="text-center py-32 text-slate-500">Listing not found</div>;

  const canContact = user && user.id !== listing.sellerId && listing.status === 'ACTIVE';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/browse" className="flex items-center gap-1 text-slate-500 hover:text-gold text-sm mb-6">
        <ChevronLeft size={14} /> Back to Browse
      </Link>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Card image */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden aspect-[5/7] bg-obsidian border border-slate-700">
            {listing.imageUri ? (
              <img src={listing.imageUri} alt={listing.cardName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <Sparkles size={48} />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-100">{listing.cardName}</h1>
                <p className="text-slate-400 mt-1">{listing.setName} <span className="text-slate-600">({listing.setCode.toUpperCase()})</span></p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-gold">${listing.price.toFixed(2)}</p>
                {listing.quantity > 1 && (
                  <p className="text-sm text-slate-500">{listing.quantity} available</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge condition={listing.condition}>{CONDITION_LABELS[listing.condition] ?? listing.condition}</Badge>
            {listing.isFoil && <span className="badge-foil">Foil</span>}
            <span className="flex items-center gap-1 text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
              <Globe size={11} /> {listing.lang.toUpperCase()}
            </span>
          </div>

          {listing.description && (
            <div className="card-surface p-4">
              <p className="text-sm text-slate-400 leading-relaxed">{listing.description}</p>
            </div>
          )}

          <div className="card-surface p-4 space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Listing details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Listed</span>
              <span className="text-slate-300">{format(new Date(listing.createdAt), 'MMM d, yyyy')}</span>
              <span className="text-slate-500">Status</span>
              <span className="text-green-400">{listing.status}</span>
            </div>
          </div>

          <SellerRating seller={listing.seller as Parameters<typeof SellerRating>[0]['seller']} />

          {canContact ? (
            <Button
              onClick={() => contactMutation.mutate()}
              disabled={contactMutation.isPending}
              className="w-full flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              {contactMutation.isPending ? 'Opening chat…' : 'Contact Seller'}
            </Button>
          ) : !user ? (
            <div className="card-surface p-4 text-center text-slate-500 text-sm">
              <Link to="/login" className="text-gold hover:text-gold-light">Sign in</Link> to contact the seller.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
