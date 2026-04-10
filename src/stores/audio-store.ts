import { create } from 'zustand';
import { SOUND_CATALOG } from '@/lib/sounds';

export type AudioChannel = {
  id: string;
  volume: number;
  enabled: boolean;
};

type AudioState = {
  channels: Record<string, AudioChannel>;
  masterVolume: number;
  isMuted: boolean;
};

type AudioActions = {
  setVolume: (id: string, volume: number) => void;
  toggleChannel: (id: string) => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  loadMix: (channels: AudioChannel[]) => void;
  resetMix: () => void;
};

function createDefaultChannels(): Record<string, AudioChannel> {
  const channels: Record<string, AudioChannel> = {};
  for (const sound of SOUND_CATALOG) {
    channels[sound.id] = {
      id: sound.id,
      volume: 0.5,
      enabled: false,
    };
  }
  return channels;
}

export const useAudioStore = create<AudioState & AudioActions>()((set) => ({
  channels: createDefaultChannels(),
  masterVolume: 0.8,
  isMuted: false,

  setVolume: (id, volume) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [id]: { ...state.channels[id], volume: Math.max(0, Math.min(1, volume)) },
      },
    })),

  toggleChannel: (id) =>
    set((state) => ({
      channels: {
        ...state.channels,
        [id]: { ...state.channels[id], enabled: !state.channels[id].enabled },
      },
    })),

  setMasterVolume: (volume) =>
    set({ masterVolume: Math.max(0, Math.min(1, volume)) }),

  toggleMute: () =>
    set((state) => ({ isMuted: !state.isMuted })),

  loadMix: (channels) =>
    set(() => {
      const newChannels = createDefaultChannels();
      for (const ch of channels) {
        if (newChannels[ch.id]) {
          newChannels[ch.id] = { ...ch, volume: Math.max(0, Math.min(1, ch.volume)) };
        }
      }
      return { channels: newChannels };
    }),

  resetMix: () =>
    set({ channels: createDefaultChannels(), masterVolume: 0.8, isMuted: false }),
}));
