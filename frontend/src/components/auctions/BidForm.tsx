import { useState } from 'react';
import { Gavel } from 'lucide-react';
import { Auction } from '../../types/api';
import { bidsApi } from '../../api/bids.api';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

interface Props {
  auction: Auction;
}

export default function BidForm({ auction }: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minBid = auction.currentBid != null ? auction.currentBid + 0.01 : auction.startingPrice;
  const isEnded = auction.status !== 'ACTIVE';
  const isSeller = user?.id === auction.sellerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const val = parseFloat(amount);
    if (isNaN(val) || val < minBid) {
      setError(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    setLoading(true);
    try {
      await bidsApi.place(auction.id, val);
      setSuccess(`Bid of $${val.toFixed(2)} placed!`);
      setAmount('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error ?? 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card-surface p-4 text-center space-y-2">
        <p className="text-slate-400 text-sm">Sign in to place a bid</p>
        <Link to="/login" className="btn-primary inline-block">Sign In</Link>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="card-surface p-4 text-center text-slate-500 text-sm">
        This is your auction
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className="card-surface p-4 text-center text-slate-500 text-sm">
        This auction has ended
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-4 space-y-3">
      <h3 className="font-semibold text-slate-200 flex items-center gap-2">
        <Gavel size={16} className="text-gold" />
        Place a Bid
      </h3>

      <div>
        <p className="text-xs text-slate-500 mb-1">Minimum bid: <span className="text-gold font-bold">${minBid.toFixed(2)}</span></p>
        {auction.buyItNowPrice && (
          <p className="text-xs text-slate-500 mb-1">Buy it now: <span className="text-green-400 font-bold">${auction.buyItNowPrice.toFixed(2)}</span></p>
        )}
        {auction.extendMinutes > 0 && (
          <p className="text-xs text-slate-600">
            Anti-snipe: bids in the last {auction.extendMinutes}m extend the timer
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
          <input
            type="number"
            step="0.01"
            min={minBid}
            placeholder={minBid.toFixed(2)}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field pl-7"
          />
        </div>
        <Button type="submit" loading={loading}>Bid</Button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">{success}</p>}
    </form>
  );
}
