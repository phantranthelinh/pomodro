import { GlassCard } from '@/components/ui/glass-card';

type DayData = {
  date: string;
  totalSec: number;
};

type HistoryChartProps = {
  data: DayData[];
  label?: string;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatHours(totalSec: number): string {
  const hours = totalSec / 3600;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const minutes = Math.floor(totalSec / 60);
  return `${minutes}m`;
}

export function HistoryChart({ data, label = 'Weekly Focus' }: HistoryChartProps) {
  const maxSec = Math.max(...data.map((d) => d.totalSec), 1);

  return (
    <GlassCard className="w-full">
      <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-4">{label}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((day) => {
          const heightPct = (day.totalSec / maxSec) * 100;
          const isEmpty = day.totalSec === 0;
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-brand-text/40 h-4">
                {!isEmpty && formatHours(day.totalSec)}
              </span>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isEmpty
                      ? 'bg-brand-dark/10'
                      : 'bg-brand-dark hover:bg-brand-dark/80'
                  }`}
                  style={{ height: isEmpty ? '4px' : `${heightPct}%` }}
                  title={`${formatDate(day.date)}: ${formatHours(day.totalSec)}`}
                />
              </div>
              <span className="text-xs text-brand-text/50">{formatDate(day.date)}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
