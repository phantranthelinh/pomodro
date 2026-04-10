import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

type TimerMode = 'focus' | 'break' | 'longBreak' | 'idle';

type TimerDisplayProps = {
  remainingSeconds: number;
  totalSeconds: number;
  mode: TimerMode;
  currentRound: number;
  maxRounds: number;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  break: 'Break',
  longBreak: 'Long Break',
  idle: 'Ready',
};

const modeColors: Record<TimerMode, string> = {
  focus: 'text-brand-text',
  break: 'text-brand-dark',
  longBreak: 'text-brand-dark/80',
  idle: 'text-brand-text/60',
};

const ringColors: Record<TimerMode, string> = {
  focus: 'var(--color-brand-text)',
  break: 'var(--color-brand-dark)',
  longBreak: 'var(--color-brand-dark)',
  idle: 'rgba(208, 255, 214, 0.3)',
};

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  mode,
  currentRound,
  maxRounds,
}: TimerDisplayProps) {
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <GlassCard variant="strong" className="flex flex-col items-center py-8">
      <p className={cn('text-sm font-medium mb-4', modeColors[mode])}>
        {modeLabels[mode]}
      </p>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(208, 255, 214, 0.3)"
            strokeWidth="6"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={ringColors[mode]}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="text-center z-10">
          <span className={cn('text-5xl font-mono font-bold', modeColors[mode])}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {Array.from({ length: maxRounds }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors',
              i < currentRound ? 'bg-brand-dark' : 'bg-brand-dark/20'
            )}
          />
        ))}
      </div>
    </GlassCard>
  );
}
