import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gavel, ShoppingBag, Search, ArrowRight } from 'lucide-react';
import { listingsApi } from '../api/listings.api';
import { auctionsApi } from '../api/auctions.api';
import ListingCard from '../components/listings/ListingCard';
import AuctionCard from '../components/auctions/AuctionCard';
import ScryfallSearch from '../components/cards/ScryfallSearch';
import { ScryfallCard } from '../types/api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const { data: listingsData } = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => listingsApi.getAll({ limit: 6, sort: 'newest' }),
  });

  const { data: auctionsData } = useQuery({
    queryKey: ['auctions', 'featured'],
    queryFn: () => auctionsApi.getAll({ limit: 6, sort: 'ending_soon' }),
  });

  const handleCardSelect = (card: ScryfallCard) => {
    navigate(`/browse?q=${encodeURIComponent(card.name)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 text-gold text-sm border border-gold/30 rounded-full px-4 py-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Live auctions happening now
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-100 leading-tight">
            The Marketplace for<br />
            <span className="text-gold">Magic Cards</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Buy and sell MTG cards at fixed prices or through live auctions with real-time bidding.
          </p>

          <div className="max-w-md mx-auto">
            <ScryfallSearch onSelect={handleCardSelect} placeholder="Search any Magic card..." />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/browse" className="btn-primary">
              Browse Listings
            </Link>
            <Link to="/browse?tab=auctions" className="btn-secondary">
              <Gavel size={16} />
              Live Auctions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-800/60 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-12 text-sm text-slate-400">
          <div className="text-center">
            <p className="text-gold font-bold text-xl">{listingsData?.total ?? '—'}</p>
            <p>Active listings</p>
          </div>
          <div className="text-center">
            <p className="text-gold font-bold text-xl">{auctionsData?.total ?? '—'}</p>
            <p>Live auctions</p>
          </div>
          <div className="text-center">
            <p className="text-gold font-bold text-xl">Free</p>
            <p>To list cards</p>
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      {(auctionsData?.data?.length ?? 0) > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
              <Gavel size={20} className="text-gold" />
              Live Auctions
              <span className="text-xs text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full ml-1">
                Ending Soon
              </span>
            </h2>
            <Link to="/browse?tab=auctions" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {auctionsData?.data.map(a => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Listings */}
      {(listingsData?.data?.length ?? 0) > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
              <ShoppingBag size={20} className="text-gold" />
              Recent Listings
            </h2>
            <Link to="/browse" className="text-sm text-gold hover:text-gold-light flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {listingsData?.data.map(l => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-slate-800/60 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-display font-semibold text-slate-100">Ready to sell your cards?</h2>
          <p className="text-slate-400">List at a fixed price or run your own auction with real-time bids.</p>
          <Link to="/create" className="btn-primary inline-flex items-center gap-2">
            <Search size={16} />
            Start Listing
          </Link>
        </div>
      </section>
    </div>
  );
}
