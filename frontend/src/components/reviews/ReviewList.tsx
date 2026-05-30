import { Review } from '../../types/api';
import StarRating from '../ui/StarRating';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <p className="text-slate-500 text-sm text-center py-4">No reviews yet</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="card-surface p-4 space-y-1">
          <div className="flex items-center gap-3">
            <StarRating value={r.rating} size={14} />
            <span className="text-slate-400 text-sm">@{r.author.username}</span>
            <span className="text-slate-600 text-xs ml-auto">
              {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
            </span>
          </div>
          {r.comment && <p className="text-slate-300 text-sm">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
}
