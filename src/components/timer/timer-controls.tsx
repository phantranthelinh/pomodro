import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TimerMode = 'focus' | 'break' | 'longBreak' | 'idle';

type TimerControlsProps = {
  isRunning: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerControls({
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {isRunning ? (
        <Button variant="default" size="lg" onClick={onPause}>
          <Pause size={22} />
          Pause
        </Button>
      ) : (
        <Button variant="default" size="lg" onClick={onStart}>
          <Play size={22} />
          {mode === 'idle' ? 'Start' : 'Resume'}
        </Button>
      )}

      <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset timer">
        <RotateCcw size={18} />
      </Button>
    </div>
  );
}
