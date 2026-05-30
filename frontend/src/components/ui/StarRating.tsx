import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export default function StarRating({ value, max = 5, size = 16, interactive, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            className={`${filled ? 'text-gold fill-gold' : 'text-slate-600'} ${interactive ? 'cursor-pointer hover:text-gold-light' : ''}`}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          />
        );
      })}
    </div>
  );
}
