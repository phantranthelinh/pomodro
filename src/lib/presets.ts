export type PresetKey = 'pomodoro' | 'deepwork' | 'quick' | 'custom';

export type TimerPreset = {
  key: PresetKey;
  label: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  rounds: number;
};

export const TIMER_PRESETS: Record<PresetKey, TimerPreset> = {
  pomodoro: {
    key: 'pomodoro',
    label: 'Pomodoro',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    rounds: 4,
  },
  deepwork: {
    key: 'deepwork',
    label: 'Deep Work',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    rounds: 2,
  },
  quick: {
    key: 'quick',
    label: 'Quick',
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    rounds: 4,
  },
  custom: {
    key: 'custom',
    label: 'Custom',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    rounds: 4,
  },
};
