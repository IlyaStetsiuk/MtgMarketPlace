import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingsApi, ListingFilters } from '../api/listings.api';
import { auctionsApi, AuctionFilters } from '../api/auctions.api';
import ListingGrid from '../components/listings/ListingGrid';
import ListingFiltersPanel, { Filters } from '../components/listings/ListingFilters';
import AuctionCard from '../components/auctions/AuctionCard';
import ScryfallSearch from '../components/cards/ScryfallSearch';
import { ScryfallCard, Auction } from '../types/api';
import { LayoutGrid, Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

type Tab = 'listings' | 'auctions';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'listings');
  const [filters, setFilters] = useState<Filters>({
    q: searchParams.get('q') ?? undefined,
    sort: 'newest',
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('tab') as Tab;
    if (q) setFilters(f => ({ ...f, q }));
    if (t) setTab(t);
  }, [searchParams]);

  const listingQuery = useQuery({
    queryKey: ['listings', filters, page],
    queryFn: () => listingsApi.getAll({ ...filters, page, limit: 24 } as ListingFilters),
    enabled: tab === 'listings',
  });

  const auctionQuery = useQuery({
    queryKey: ['auctions', filters, page],
    queryFn: () => auctionsApi.getAll({
      ...filters,
      page,
      limit: 24,
      sort: (filters.sort as AuctionFilters['sort']) ?? 'ending_soon',
    }),
    enabled: tab === 'auctions',
  });

  const handleCardSelect = (card: ScryfallCard) => {
    setFilters(f => ({ ...f, q: card.name }));
    setPage(1);
  };

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const total = tab === 'listings' ? listingQuery.data?.total : auctionQuery.data?.total;
  const totalPages = Math.ceil((total ?? 0) / 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <ScryfallSearch
            onSelect={handleCardSelect}
            placeholder="Search cards..."
          />
        </div>
        <div className="flex rounded-lg border border-slate-700 overflow-hidden shrink-0">
          <button
            onClick={() => { setTab('listings'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${tab === 'listings' ? 'bg-gold/15 text-gold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutGrid size={15} /> Fixed Price
          </button>
          <button
            onClick={() => { setTab('auctions'); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border-l border-slate-700 ${tab === 'auctions' ? 'bg-gold/15 text-gold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Gavel size={15} /> Auctions
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="w-52 shrink-0 hidden md:block">
          <ListingFiltersPanel
            filters={filters}
            onChange={handleFiltersChange}
            showSort
            sortOptions={
              tab === 'auctions'
                ? [
                    { value: 'ending_soon', label: 'Ending soon' },
                    { value: 'newest', label: 'Newest first' },
                    { value: 'price_asc', label: 'Price: low → high' },
                    { value: 'price_desc', label: 'Price: high → low' },
                  ]
                : undefined
            }
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {total !== undefined && (
            <p className="text-sm text-slate-500 mb-4">{total} result{total !== 1 ? 's' : ''}</p>
          )}

          {tab === 'listings' && (
            <ListingGrid
              listings={listingQuery.data?.data ?? []}
              loading={listingQuery.isLoading}
            />
          )}

          {tab === 'auctions' && (
            auctionQuery.isLoading ? (
              <div className="flex items-center justify-center py-20"><Spinner size={32} /></div>
            ) : (auctionQuery.data?.data?.length ?? 0) === 0 ? (
              <div className="text-center py-16 text-slate-500">No auctions found</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {auctionQuery.data?.data.map((a: Auction) => (
                  <AuctionCard key={a.id} auction={a} />
                ))}
              </div>
            )
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
