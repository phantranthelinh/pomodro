'use client';

import { useEffect } from 'react';
import { TimerDisplay } from '@/components/timer/timer-display';
import { TimerControls } from '@/components/timer/timer-controls';
import { PresetSelector } from '@/components/timer/preset-selector';
import { MixerPanel } from '@/components/audio/mixer-panel';
import { StatsCard } from '@/components/social/stats-card';
import { useTimer } from '@/hooks/use-timer';
import { useNotification } from '@/hooks/use-notification';
import { trpc } from '@/lib/trpc-client';
import { useSession } from 'next-auth/react';

export default function TimerPage() {
  const {
    mode,
    preset,
    totalSeconds,
    remainingSeconds,
    currentRound,
    maxRounds,
    isRunning,
    start,
    pause,
    reset,
    setPreset,
  } = useTimer();

  const { requestPermission, notifyTimerComplete } = useNotification();
  const { data: session } = useSession();

  const statsQuery = trpc.timer.stats.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const handleStart = () => {
    requestPermission();
    start();
  };

  useEffect(() => {
    if (remainingSeconds === 0 && mode !== 'idle') {
      notifyTimerComplete(mode);
    }
  }, [remainingSeconds, mode, notifyTimerComplete]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TimerDisplay
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            mode={mode}
            currentRound={currentRound}
            maxRounds={maxRounds}
          />

          <PresetSelector
            activePreset={preset}
            onSelect={setPreset}
            disabled={isRunning}
          />

          <TimerControls
            isRunning={isRunning}
            mode={mode}
            onStart={handleStart}
            onPause={pause}
            onReset={reset}
          />

          {statsQuery.data && (
            <StatsCard
              todaySessions={statsQuery.data.today.sessions}
              todayFocusSec={statsQuery.data.today.totalSec}
              streak={statsQuery.data.streak}
              totalSessions={statsQuery.data.total.sessions}
            />
          )}
        </div>

        <div className="space-y-6">
          <MixerPanel />
        </div>
      </div>
    </main>
  );
}
