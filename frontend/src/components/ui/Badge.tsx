import { ReactNode } from 'react';

type Color = 'gold' | 'green' | 'red' | 'purple' | 'slate' | 'blue';

const colors: Record<Color, string> = {
  gold: 'bg-gold/15 text-gold border-gold/30',
  green: 'bg-green-500/15 text-green-400 border-green-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  slate: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const CONDITIONS: Record<string, Color> = {
  MINT: 'green', NEAR_MINT: 'green', EXCELLENT: 'blue',
  GOOD: 'gold', LIGHT_PLAYED: 'gold', PLAYED: 'red', POOR: 'red',
};

interface BadgeProps {
  children: ReactNode;
  color?: Color;
  condition?: string;
  className?: string;
}

export default function Badge({ children, color, condition, className = '' }: BadgeProps) {
  const c = color ?? (condition ? CONDITIONS[condition] ?? 'slate' : 'slate');
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded border font-medium ${colors[c]} ${className}`}>
      {children}
    </span>
  );
}
