import Image from 'next/image';
import { GlassCard } from '@/components/ui/glass-card';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  totalSec: number;
  sessions: number;
};

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

function formatFocusHours(totalSec: number): string {
  const hours = totalSec / 3600;
  return `${hours.toFixed(1)}h`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Trophy size={18} className="text-rank-gold shrink-0" aria-label="1st place" />;
  }
  if (rank === 2) {
    return <Medal size={18} className="text-rank-silver shrink-0" aria-label="2nd place" />;
  }
  if (rank === 3) {
    return <Medal size={18} className="text-rank-bronze shrink-0" aria-label="3rd place" />;
  }
  return (
    <span className="w-[18px] text-center text-sm font-medium text-brand-text/50 shrink-0">
      {rank}
    </span>
  );
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <GlassCard className="w-full">
        <p className="text-brand-text/50 text-sm text-center py-4">No data yet. Start focusing!</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full p-0 overflow-hidden">
      <ul className="divide-y divide-brand-dark/10">
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          return (
            <li
              key={entry.userId}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isCurrentUser ? 'bg-brand-dark/20' : 'hover:bg-brand-light/20'
              )}
              aria-current={isCurrentUser ? 'true' : undefined}
            >
              <RankBadge rank={entry.rank} />

              {entry.image ? (
                <Image
                  src={entry.image}
                  alt={entry.name ?? 'User avatar'}
                  width={32}
                  height={32}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-dark/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-brand-text">
                    {(entry.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <span
                className={cn(
                  'flex-1 text-sm truncate',
                  isCurrentUser ? 'font-semibold text-brand-text' : 'text-brand-text/80'
                )}
              >
                {entry.name ?? 'Anonymous'}
                {isCurrentUser && (
                  <span className="ml-1 text-xs text-brand-text/50">(you)</span>
                )}
              </span>

              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-brand-text">
                  {formatFocusHours(entry.totalSec)}
                </p>
                <p className="text-xs text-brand-text/40">{entry.sessions} sessions</p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
