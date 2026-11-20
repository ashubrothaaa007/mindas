# Architecture

## Application shape

MINDA is a single-page React application. `src/main.tsx` mounts `src/App.tsx`; the app selects welcome, onboarding, world, learning-path, and profile screens from the Zustand game store. Shared overlays (activities, missions, inventory, rewards, and companion UI) are mounted by the app shell.

## Main areas

- `src/pages/` contains the top-level screens.
- `src/components/` contains game HUD, world objects, character/mascot, learning, voice, mission, reward, and reusable UI components.
- `src/scenes/` composes the welcome diorama and interactive 3D world.
- `src/systems/` contains movement/input, collision, travel, and time behavior.
- `src/store/game.ts` owns the screen, profile, settings, progression, rewards, and transient overlay state. Zustand persist saves profile, settings, and progress to local storage under `minda-save-v1`.
- `src/data/` contains authored languages, translations, missions, learning activities, world locations, and achievements.
- `src/services/voice/` implements browser/backend speech recognition and speech output. `src/services/ai/evaluate.ts` provides local concept evaluation and an optional `/evaluate` backend call.
- `src/services/audio/` creates procedural ambience and short audio cues with Web Audio.

## Learning and rewards

Mission, unit, and activity definitions are static authored data. Store actions update local progression, calculate XP/coin awards, track completion and achievements, and persist the resulting state. Purchases and hints are also local store actions. Because these values live in browser storage and can be edited by the user, this is appropriate for a single-player prototype but not a trusted multiplayer economy. A production backend must validate completion and make reward mutations authoritative.

## Voice and evaluation flow

`VoiceInput` requests microphone access and starts a level meter. Without a backend URL, it uses browser speech recognition when supported. With a backend URL, it records audio and posts it to `/stt`. The conversation UI passes the transcript and authored expected response/concepts into `evaluate`; local matching always runs, and remote evaluation can supply additional feedback. If the remote request fails, the local result is returned. TTS similarly tries `/tts` when configured, then falls back to browser speech or a romanised approximation.

The frontend does not implement a Gemini or Sarvam server, Supabase persistence, authentication, or API-key storage. Keep provider secrets on a trusted server. `VITE_MINDA_API_URL` is a public endpoint URL, not a secret.

## Runtime and build

Vite configures React, Tailwind, the `@` source alias, and the project build. `MINDA_PUBLIC_URL` can set a deployment base path, while `PORT` and `MINDA_DEV_SERVER_HOST` configure the development and preview servers. pnpm is the package manager, with `pnpm-lock.yaml` as the dependency lockfile.
