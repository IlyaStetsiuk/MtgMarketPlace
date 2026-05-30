import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';

export interface Filters {
  q?: string;
  condition?: string;
  setCode?: string;
  minPrice?: number;
  maxPrice?: number;
  isFoil?: boolean;
  sort?: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  showSort?: boolean;
  sortOptions?: { value: string; label: string }[];
}

const CONDITIONS = ['MINT', 'NEAR_MINT', 'EXCELLENT', 'GOOD', 'LIGHT_PLAYED', 'PLAYED', 'POOR'];
const CONDITION_LABELS: Record<string, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excellent', GOOD: 'Good',
  LIGHT_PLAYED: 'Light Played', PLAYED: 'Played', POOR: 'Poor',
};

const DEFAULT_SORT = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export default function ListingFilters({ filters, onChange, showSort = true, sortOptions }: Props) {
  const [open, setOpen] = useState(true);

  const update = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-slate-400 hover:text-gold mb-3 w-full"
      >
        <SlidersHorizontal size={16} />
        <span className="font-medium text-sm">Filters</span>
        {open ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
      </button>

      {open && (
        <div className="space-y-5 text-sm">
          {showSort && (
            <div>
              <p className="text-slate-500 mb-2 text-xs uppercase tracking-wider">Sort by</p>
              <select
                className="input-field"
                value={filters.sort ?? 'newest'}
                onChange={e => update({ sort: e.target.value })}
              >
                {(sortOptions ?? DEFAULT_SORT).map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className="text-slate-500 mb-2 text-xs uppercase tracking-wider">Condition</p>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input type="radio" name="cond" checked={!filters.condition} onChange={() => update({ condition: undefined })} className="accent-gold" />
                Any condition
              </label>
              {CONDITIONS.map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input type="radio" name="cond" checked={filters.condition === c} onChange={() => update({ condition: c })} className="accent-gold" />
                  {CONDITION_LABELS[c]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-500 mb-2 text-xs uppercase tracking-wider">Price range</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min={0}
                className="input-field"
                value={filters.minPrice ?? ''}
                onChange={e => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
              <input
                type="number"
                placeholder="Max"
                min={0}
                className="input-field"
                value={filters.maxPrice ?? ''}
                onChange={e => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                className="accent-gold"
                checked={filters.isFoil ?? false}
                onChange={e => update({ isFoil: e.target.checked || undefined })}
              />
              Foil only
            </label>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-slate-500"
            onClick={() => onChange({})}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </aside>
  );
}
