import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ScryfallCard } from '../../types/api';
import { scryfallApi } from '../../api/scryfall.api';

interface Props {
  onSelect: (card: ScryfallCard) => void;
  placeholder?: string;
}

export default function ScryfallSearch({ onSelect, placeholder = 'Search for a card...' }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounce.current);
    if (value.length < 2) { setSuggestions([]); setOpen(false); return; }

    debounce.current = setTimeout(async () => {
      try {
        const names = await scryfallApi.autocomplete(value);
        setSuggestions(names.slice(0, 8));
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 300);
  };

  const handleSelect = async (name: string) => {
    setQuery(name);
    setOpen(false);
    try {
      const card = await scryfallApi.getByName(name);
      onSelect(card);
    } catch (err) {
      console.error('Card not found', err);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 card-surface border border-gold/20 rounded-lg overflow-hidden shadow-xl shadow-black/50">
          {suggestions.map(name => (
            <li key={name}>
              <button
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gold/10 hover:text-gold transition-colors"
                onClick={() => handleSelect(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
