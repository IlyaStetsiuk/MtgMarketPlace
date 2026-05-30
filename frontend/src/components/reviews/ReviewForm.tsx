import { useState } from 'react';
import { reviewsApi } from '../../api/reviews.api';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

interface Props {
  targetId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ targetId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    try {
      await reviewsApi.create({ targetId, rating, comment: comment || undefined });
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch {
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-sm text-slate-400 mb-2">Your rating</p>
        <StarRating value={rating} interactive onChange={setRating} size={24} />
      </div>
      <textarea
        className="input-field resize-none"
        rows={3}
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={500}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <Button type="submit" loading={loading} disabled={rating === 0}>Submit Review</Button>
    </form>
  );
}
