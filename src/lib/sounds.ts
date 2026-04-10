export type SoundCategory = 'ambient' | 'lofi';

export type SoundDefinition = {
  id: string;
  label: string;
  category: SoundCategory;
  src: string;
};

export const SOUND_CATALOG: SoundDefinition[] = [
  { id: 'rain',       label: 'Rain',       category: 'ambient', src: '/sounds/ambient/rain.mp3'       },
  { id: 'ocean',      label: 'Ocean',      category: 'ambient', src: '/sounds/ambient/ocean.mp3'      },
  { id: 'fire',       label: 'Fire',       category: 'ambient', src: '/sounds/ambient/fire.mp3'       },
  { id: 'birds',      label: 'Birds',      category: 'ambient', src: '/sounds/ambient/birds.mp3'      },
  { id: 'wind',       label: 'Wind',       category: 'ambient', src: '/sounds/ambient/wind.mp3'       },
  { id: 'lofi-chill', label: 'Lo-fi Chill', category: 'lofi',  src: '/sounds/lofi/lofi-chill.mp3'   },
  { id: 'lofi-jazz',  label: 'Lo-fi Jazz',  category: 'lofi',  src: '/sounds/lofi/lofi-jazz.mp3'    },
  { id: 'lofi-piano', label: 'Lo-fi Piano', category: 'lofi',  src: '/sounds/lofi/lofi-piano.mp3'   },
];

export const AMBIENT_SOUNDS = SOUND_CATALOG.filter(s => s.category === 'ambient');
export const LOFI_SOUNDS    = SOUND_CATALOG.filter(s => s.category === 'lofi');
