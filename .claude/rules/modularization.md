# Modularization

- Audio logic (`use-audio-mixer`) and timer logic (`use-timer`) must NEVER live in UI component files.
- All business logic must be in Custom Hooks (`src/hooks/`) or Zustand stores (`src/stores/`).
- Components are purely presentational + hook consumers.
