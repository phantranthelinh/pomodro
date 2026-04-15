'use client';

import { useEffect } from 'react';
import { TimerDisplay } from '@/components/timer/timer-display';
import { TimerControls } from '@/components/timer/timer-controls';
import { PresetSelector } from '@/components/timer/preset-selector';
import { MixerPanel } from '@/components/audio/mixer-panel';
import { StatsCard } from '@/components/social/stats-card';
import { Mascot } from '@/components/timer/mascot';
import { DailyTracker } from '@/components/timer/daily-tracker';
import { useTimer } from '@/hooks/use-timer';
import { useNotification } from '@/hooks/use-notification';
import { trpc } from '@/lib/trpc-client';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

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

  // Dynamic Status Text Logic
  let statusText = "Let's focus together";
  if (isRunning) {
    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    if (progress > 0.8) statusText = "Almost there!";
    else if (progress > 0.1) statusText = "Keep going!";
  } else if (remainingSeconds === 0 && currentRound >= maxRounds) {
    statusText = "You did it!";
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-500 flex justify-center items-center">
      
      <main className="relative z-10 w-full max-w-sm mx-auto px-4 py-8 flex flex-col items-center justify-between min-h-[90vh]">
        {/* Header */}
        <header className="w-full text-center mb-6">
          <h1 className="text-xl font-bold tracking-tight text-black/80">JerryPomo</h1>
        </header>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-6">
          <Mascot 
            currentRound={currentRound} 
            maxRounds={maxRounds} 
            isRunning={isRunning} 
            mode={mode} 
          />
          
          <motion.p 
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-black/60 tracking-wide"
          >
            {statusText}
          </motion.p>
          
          <TimerDisplay
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            mode={mode}
            currentRound={currentRound}
            maxRounds={maxRounds}
          />
        </div>

        {/* Controls & Presets */}
        <div className="w-full mt-8 space-y-8 flex flex-col items-center">
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
        </div>
        
      </main>

      {/* Daily Tracking Bottom Sheet — fixed overlay, works for all users */}
      <DailyTracker />
    </div>
  );
}
