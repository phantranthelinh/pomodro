import { create } from 'zustand';
import { TIMER_PRESETS, PresetKey } from '@/lib/presets';

type TimerMode = 'focus' | 'break' | 'longBreak' | 'idle';

type TimerConfig = {
  focusMin: number;
  breakMin: number;
  longBreakMin: number;
  rounds: number;
};

type TimerState = {
  mode: TimerMode;
  preset: PresetKey;
  totalSeconds: number;
  remainingSeconds: number;
  currentRound: number;
  maxRounds: number;
  isRunning: boolean;
  customConfig: TimerConfig;
};

type TimerActions = {
  setPreset: (preset: PresetKey) => void;
  setCustomConfig: (config: TimerConfig) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchToNextMode: () => void;
};

function getConfig(state: TimerState): TimerConfig {
  if (state.preset === 'custom') return state.customConfig;
  const p = TIMER_PRESETS[state.preset];
  return {
    focusMin: p.focusMinutes,
    breakMin: p.shortBreakMinutes,
    longBreakMin: p.longBreakMinutes,
    rounds: p.rounds,
  };
}

function getSecondsForMode(mode: TimerMode, config: TimerConfig): number {
  switch (mode) {
    case 'focus': return config.focusMin * 60;
    case 'break': return config.breakMin * 60;
    case 'longBreak': return config.longBreakMin * 60;
    case 'idle': return 0;
  }
}

export const useTimerStore = create<TimerState & TimerActions>()((set, get) => ({
  mode: 'idle',
  preset: 'pomodoro',
  totalSeconds: TIMER_PRESETS.pomodoro.focusMinutes * 60,
  remainingSeconds: TIMER_PRESETS.pomodoro.focusMinutes * 60,
  currentRound: 1,
  maxRounds: TIMER_PRESETS.pomodoro.rounds,
  isRunning: false,
  customConfig: {
    focusMin: 25,
    breakMin: 5,
    longBreakMin: 15,
    rounds: 4,
  },

  setPreset: (preset) => {
    const config = preset === 'custom' ? get().customConfig : {
      focusMin: TIMER_PRESETS[preset].focusMinutes,
      breakMin: TIMER_PRESETS[preset].shortBreakMinutes,
      longBreakMin: TIMER_PRESETS[preset].longBreakMinutes,
      rounds: TIMER_PRESETS[preset].rounds,
    };
    const seconds = config.focusMin * 60;
    set({
      preset,
      mode: 'idle',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: 1,
      maxRounds: config.rounds,
      isRunning: false,
    });
  },

  setCustomConfig: (config) => {
    const seconds = config.focusMin * 60;
    set({
      preset: 'custom',
      customConfig: config,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      maxRounds: config.rounds,
      mode: 'idle',
      currentRound: 1,
      isRunning: false,
    });
  },

  start: () => {
    const state = get();
    if (state.mode === 'idle') {
      const config = getConfig(state);
      const seconds = config.focusMin * 60;
      set({
        mode: 'focus',
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isRunning: true,
      });
    } else {
      set({ isRunning: true });
    }
  },

  pause: () => set({ isRunning: false }),

  reset: () => {
    const state = get();
    const config = getConfig(state);
    const seconds = config.focusMin * 60;
    set({
      mode: 'idle',
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: 1,
      isRunning: false,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.remainingSeconds <= 0) return;

    const newRemaining = state.remainingSeconds - 1;
    if (newRemaining <= 0) {
      set({ remainingSeconds: 0, isRunning: false });
    } else {
      set({ remainingSeconds: newRemaining });
    }
  },

  switchToNextMode: () => {
    const state = get();
    const config = getConfig(state);
    let nextMode: TimerMode;
    let nextRound = state.currentRound;

    if (state.mode === 'focus') {
      if (state.currentRound >= state.maxRounds) {
        nextMode = 'longBreak';
      } else {
        nextMode = 'break';
      }
    } else if (state.mode === 'break') {
      nextMode = 'focus';
      nextRound = state.currentRound + 1;
    } else {
      nextMode = 'idle';
      nextRound = 1;
    }

    const seconds = getSecondsForMode(nextMode, config);
    set({
      mode: nextMode,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      currentRound: nextRound,
      isRunning: false,
    });
  },
}));
