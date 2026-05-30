import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScryfallCard } from '../types/api';
import { listingsApi } from '../api/listings.api';
import { auctionsApi } from '../api/auctions.api';
import ScryfallSearch from '../components/cards/ScryfallSearch';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Sparkles, ShoppingBag, Gavel, ChevronRight, ChevronLeft } from 'lucide-react';

type ListingType = 'fixed' | 'auction';

const CONDITIONS = [
  { value: 'MINT', label: 'Mint (M)' },
  { value: 'NEAR_MINT', label: 'Near Mint (NM)' },
  { value: 'EXCELLENT', label: 'Excellent (EX)' },
  { value: 'GOOD', label: 'Good (GD)' },
  { value: 'LIGHT_PLAYED', label: 'Light Played (LP)' },
  { value: 'PLAYED', label: 'Played (PL)' },
  { value: 'POOR', label: 'Poor (PR)' },
];

function getCardImage(card: ScryfallCard): string {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return '';
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [card, setCard] = useState<ScryfallCard | null>(null);
  const [type, setType] = useState<ListingType>('fixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fixed price fields
  const [condition, setCondition] = useState('NEAR_MINT');
  const [isFoil, setIsFoil] = useState(false);
  const [lang, setLang] = useState('en');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');

  // Auction-only fields
  const [startingPrice, setStartingPrice] = useState('');
  const [buyItNow, setBuyItNow] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [extendMinutes, setExtendMinutes] = useState('5');

  const minEndsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  const handleSubmit = async () => {
    if (!card) return;
    setLoading(true);
    setError('');

    const imageUri = getCardImage(card);

    try {
      if (type === 'fixed') {
        const listing = await listingsApi.create({
          scryfallId: card.id,
          cardName: card.name,
          setCode: card.set,
          setName: card.set_name,
          imageUri,
          lang,
          condition,
          isFoil,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          description: description || undefined,
        });
        navigate(`/listings/${listing.id}`);
      } else {
        const auction = await auctionsApi.create({
          scryfallId: card.id,
          cardName: card.name,
          setCode: card.set,
          setName: card.set_name,
          imageUri,
          lang,
          condition,
          isFoil,
          description: description || undefined,
          startingPrice: parseFloat(startingPrice),
          buyItNowPrice: buyItNow ? parseFloat(buyItNow) : undefined,
          endsAt: new Date(endsAt).toISOString(),
          extendMinutes: parseInt(extendMinutes),
        });
        navigate(`/auctions/${auction.id}`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error ?? 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-slate-100 mb-2">List a Card</h1>
      <p className="text-slate-500 mb-8">Sell at a fixed price or run an auction with live bidding</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${s === step ? 'bg-gold text-obsidian-dark' : s < step ? 'bg-gold/30 text-gold' : 'bg-obsidian-light text-slate-500'}`}>
              {s}
            </div>
            {s < 3 && <div className={`h-px w-8 ${s < step ? 'bg-gold/40' : 'bg-slate-700'}`} />}
          </div>
        ))}
        <span className="text-slate-500 ml-2">
          {step === 1 ? 'Choose card' : step === 2 ? 'Listing type' : 'Details'}
        </span>
      </div>

      {/* Step 1: Card search */}
      {step === 1 && (
        <div className="space-y-6">
          <ScryfallSearch onSelect={(c) => { setCard(c); setStep(2); }} placeholder="Search for a Magic card..." />

          {card && (
            <div className="card-surface p-4 flex gap-4">
              <img src={getCardImage(card)} alt={card.name} className="w-20 rounded-lg" />
              <div>
                <p className="font-semibold text-slate-100">{card.name}</p>
                <p className="text-sm text-slate-400">{card.set_name}</p>
                <p className="text-sm text-slate-500 mt-1">{card.type_line}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Type */}
      {step === 2 && card && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setType('fixed')}
              className={`flex-1 card-surface p-5 text-left transition-all ${type === 'fixed' ? 'border-gold/60 bg-gold/5' : 'card-hover'}`}
            >
              <ShoppingBag size={20} className={`mb-2 ${type === 'fixed' ? 'text-gold' : 'text-slate-500'}`} />
              <p className="font-semibold text-slate-100">Fixed Price</p>
              <p className="text-sm text-slate-400 mt-1">Set a price, buyers purchase instantly</p>
            </button>
            <button
              onClick={() => setType('auction')}
              className={`flex-1 card-surface p-5 text-left transition-all ${type === 'auction' ? 'border-gold/60 bg-gold/5' : 'card-hover'}`}
            >
              <Gavel size={20} className={`mb-2 ${type === 'auction' ? 'text-gold' : 'text-slate-500'}`} />
              <p className="font-semibold text-slate-100">Auction</p>
              <p className="text-sm text-slate-400 mt-1">Real-time bids, anti-snipe protection</p>
            </button>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => setStep(1)}><ChevronLeft size={14} /> Back</Button>
            <Button className="flex-1" onClick={() => setStep(3)}>Continue <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && card && (
        <div className="space-y-4">
          <div className="card-surface p-4 flex gap-4 items-center mb-2">
            <img src={getCardImage(card)} alt={card.name} className="w-14 rounded" />
            <div>
              <p className="font-semibold text-slate-100">{card.name}</p>
              <p className="text-xs text-slate-500">{card.set_name} · {type === 'fixed' ? 'Fixed Price' : 'Auction'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Condition</label>
              <select className="input-field" value={condition} onChange={e => setCondition(e.target.value)}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Language</label>
              <select className="input-field" value={lang} onChange={e => setLang(e.target.value)}>
                {['en', 'de', 'fr', 'es', 'it', 'pt', 'ja', 'ko', 'ru', 'zhs', 'zht'].map(l => (
                  <option key={l} value={l}>{l.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-400">
            <input type="checkbox" className="accent-gold" checked={isFoil} onChange={e => setIsFoil(e.target.checked)} />
            Foil
          </label>

          {type === 'fixed' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (USD)" type="number" min="0.01" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
              <Input label="Quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Starting price (USD)" type="number" min="0.01" step="0.01" placeholder="0.01" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} />
                <Input label="Buy it now (optional)" type="number" min="0.01" step="0.01" placeholder="—" value={buyItNow} onChange={e => setBuyItNow(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Ends at</label>
                  <input type="datetime-local" min={minEndsAt} className="input-field" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Anti-snipe extend (minutes)</label>
                  <input type="number" min="1" max="60" className="input-field" value={extendMinutes} onChange={e => setExtendMinutes(e.target.value)} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Description (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Add notes about the card's condition, shipping, etc."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep(2)}><ChevronLeft size={14} /> Back</Button>
            <Button className="flex-1" loading={loading} onClick={handleSubmit}>
              <Sparkles size={16} />
              {type === 'fixed' ? 'Create Listing' : 'Start Auction'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
