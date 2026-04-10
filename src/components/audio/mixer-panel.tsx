'use client';

import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { SoundToggle } from './sound-toggle';
import { VolumeSlider } from './volume-slider';
import { useAudioMixer } from '@/hooks/use-audio-mixer';
import { useUiStore } from '@/stores/ui-store';
import { SOUND_CATALOG } from '@/lib/sounds';

export function MixerPanel() {
  const {
    channels,
    masterVolume,
    isMuted,
    setVolume,
    toggleChannel,
    setMasterVolume,
    toggleMute,
  } = useAudioMixer();

  const { mixerOpen, toggleMixer } = useUiStore();

  const enabledCount = Object.values(channels).filter((ch) => ch.enabled).length;

  const ambientSounds = SOUND_CATALOG.filter((s) => s.category === 'ambient');
  const lofiSounds = SOUND_CATALOG.filter((s) => s.category === 'lofi');

  return (
    <GlassCard className="w-full">
      <button
        onClick={toggleMixer}
        className="w-full flex items-center justify-between"
        aria-expanded={mixerOpen}
      >
        <div className="flex items-center gap-2">
          <Volume2 size={20} className="text-brand-text" />
          <span className="font-medium text-brand-text">Sound Mixer</span>
          {enabledCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-dark/30 text-brand-text">
              {enabledCount} active
            </span>
          )}
        </div>
        {mixerOpen ? (
          <ChevronUp size={20} className="text-brand-text/60" />
        ) : (
          <ChevronDown size={20} className="text-brand-text/60" />
        )}
      </button>

      {mixerOpen && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="shrink-0" aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? (
                <VolumeX size={20} className="text-red-400" />
              ) : (
                <Volume2 size={20} className="text-brand-text" />
              )}
            </button>
            <VolumeSlider
              value={masterVolume}
              onChange={setMasterVolume}
              label="Master"
              disabled={isMuted}
            />
          </div>

          <hr className="border-brand-dark/20" />

          <div>
            <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-2">Ambient</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {ambientSounds.map((sound) => (
                <SoundToggle
                  key={sound.id}
                  id={sound.id}
                  label={sound.label}
                  enabled={channels[sound.id]?.enabled ?? false}
                  onToggle={() => toggleChannel(sound.id)}
                />
              ))}
            </div>
            <div className="mt-2 space-y-2">
              {ambientSounds
                .filter((s) => channels[s.id]?.enabled)
                .map((sound) => (
                  <VolumeSlider
                    key={sound.id}
                    value={channels[sound.id].volume}
                    onChange={(v) => setVolume(sound.id, v)}
                    label={sound.label}
                  />
                ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-brand-text/50 uppercase tracking-wider mb-2">Lo-fi</p>
            <div className="grid grid-cols-3 gap-2">
              {lofiSounds.map((sound) => (
                <SoundToggle
                  key={sound.id}
                  id={sound.id}
                  label={sound.label}
                  enabled={channels[sound.id]?.enabled ?? false}
                  onToggle={() => toggleChannel(sound.id)}
                />
              ))}
            </div>
            <div className="mt-2 space-y-2">
              {lofiSounds
                .filter((s) => channels[s.id]?.enabled)
                .map((sound) => (
                  <VolumeSlider
                    key={sound.id}
                    value={channels[sound.id].volume}
                    onChange={(v) => setVolume(sound.id, v)}
                    label={sound.label}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
