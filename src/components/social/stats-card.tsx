import { GlassCard } from '@/components/ui/glass-card';
import { Clock, Flame, Target, TrendingUp } from 'lucide-react';

type StatsCardProps = {
  todaySessions: number;
  todayFocusSec: number;
  streak: number;
  totalSessions: number;
};

function formatFocusTime(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

type StatItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-3">
      <div className="text-brand-text/60">{icon}</div>
      <span className="text-2xl font-bold text-brand-text">{value}</span>
      <span className="text-xs text-brand-text/50 text-center">{label}</span>
    </div>
  );
}

export function StatsCard({ todaySessions, todayFocusSec, streak, totalSessions }: StatsCardProps) {
  return (
    <GlassCard className="w-full">
      <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-3">Your Stats</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatItem
          icon={<Target size={18} />}
          label="Today's Sessions"
          value={todaySessions}
        />
        <StatItem
          icon={<Clock size={18} />}
          label="Today's Focus"
          value={formatFocusTime(todayFocusSec)}
        />
        <StatItem
          icon={<Flame size={18} />}
          label="Day Streak"
          value={streak}
        />
        <StatItem
          icon={<TrendingUp size={18} />}
          label="Total Sessions"
          value={totalSessions}
        />
      </div>
    </GlassCard>
  );
}
