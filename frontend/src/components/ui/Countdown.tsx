import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

function formatTime(seconds: number) {
  if (seconds <= 0) return 'Ended';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function Countdown({ endsAt, className = '' }: { endsAt: string; className?: string }) {
  const [secs, setSecs] = useState(() => differenceInSeconds(new Date(endsAt), new Date()));

  useEffect(() => {
    setSecs(differenceInSeconds(new Date(endsAt), new Date()));
    const id = setInterval(() => {
      setSecs(differenceInSeconds(new Date(endsAt), new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const urgent = secs > 0 && secs < 300; // < 5 minutes

  return (
    <span className={`font-mono tabular-nums ${urgent ? 'text-red-400 animate-pulse' : 'text-gold'} ${className}`}>
      {formatTime(Math.max(0, secs))}
    </span>
  );
}
