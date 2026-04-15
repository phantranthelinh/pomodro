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

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  mode,
  currentRound,
  maxRounds,
}: TimerDisplayProps) {
  return (
    <div className="flex flex-col items-center py-4 relative bg-black/5 rounded-3xl mx-auto w-full max-w-sm backdrop-blur-sm">
      <div className="text-center z-10 flex flex-col items-center justify-center">
        <span className="text-5xl font-sans font-black tracking-tight text-black/90 leading-none transition-all duration-300">
          {formatTime(remainingSeconds)}
        </span>
      </div>

      <div className="flex gap-2 mt-4 bg-white/40 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
        {Array.from({ length: maxRounds }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              i < currentRound ? 'bg-black/90' : 'bg-black/20'
            )}
          />
        ))}
      </div>
    </div>
  );
}
