---
phase: 3
task: 10
status: done
---

# Task 10: MixerPanel Component

**Phase:** 3 — Atomic Components
**Status:** pending

## Files

- Create: `src/components/audio/mixer-panel.tsx`

## Steps

- Create expandable MixerPanel with master volume, ambient/lofi sections
- Import useAudioMixer from @/hooks/use-audio-mixer
- Import useUiStore from @/stores/ui-store (exports useUiStore, not useUIStore)
- SOUND_CATALOG uses sound.id and sound.label (not sound.key/sound.name)
- channels keyed by sound.id

## Commit

`feat: create MixerPanel with expandable channels, toggles, and volume sliders`
