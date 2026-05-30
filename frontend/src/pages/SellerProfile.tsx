import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import client from '../api/client';
import { reviewsApi } from '../api/reviews.api';
import { User, Listing, Auction } from '../types/api';
import StarRating from '../components/ui/StarRating';
import ListingCard from '../components/listings/ListingCard';
import AuctionCard from '../components/auctions/AuctionCard';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ShoppingBag, Gavel, Star, Calendar } from 'lucide-react';

type Tab = 'listings' | 'auctions' | 'reviews';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => client.get<{ data: User }>(`/users/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: listings } = useQuery({
    queryKey: ['user-listings', id],
    queryFn: () => client.get<{ data: Listing[] }>(`/users/${id}/listings`).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: auctions } = useQuery({
    queryKey: ['user-auctions', id],
    queryFn: () => client.get<{ data: Auction[] }>(`/users/${id}/auctions`).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getForUser(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size={40} /></div>;
  if (!user) return <div className="text-center py-32 text-slate-500">User not found</div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'listings', label: 'Listings', icon: <ShoppingBag size={14} />, count: listings?.length },
    { key: 'auctions', label: 'Auctions', icon: <Gavel size={14} />, count: auctions?.length },
    { key: 'reviews', label: 'Reviews', icon: <Star size={14} />, count: reviews?.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card-surface p-6 flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-2xl shrink-0">
          {user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-slate-100">@{user.username}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StarRating value={user.averageRating} size={16} />
            <span className="text-slate-300">{user.averageRating.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">({user.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm">
            <Calendar size={13} />
            Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
          </div>
        </div>

        {me && me.id !== id && (
          <button
            onClick={() => setShowReviewForm(v => !v)}
            className="btn-secondary text-sm shrink-0"
          >
            Leave Review
          </button>
        )}
      </div>

      {showReviewForm && me && (
        <div className="card-surface p-5 mb-6">
          <h3 className="font-semibold text-slate-200 mb-4">Write a Review for @{user.username}</h3>
          <ReviewForm
            targetId={id!}
            onSuccess={() => {
              setShowReviewForm(false);
              refetchReviews();
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
              tab === t.key ? 'border-gold text-gold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className="text-xs text-slate-600">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        listings?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12">No active listings</p>
        )
      )}

      {tab === 'auctions' && (
        auctions?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12">No active auctions</p>
        )
      )}

      {tab === 'reviews' && (
        <ReviewList reviews={reviews ?? []} />
      )}
    </div>
  );
}
