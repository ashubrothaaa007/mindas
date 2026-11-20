# Development

## Setup

Install the Node.js version specified by `.mise.toml`, enable pnpm, then install from the committed lockfile:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Vite uses port `8443` by default. Set `PORT` to override it, `MINDA_DEV_SERVER_HOST` to change the bind host, or `MINDA_PUBLIC_URL` when deploying under a base path.

## Optional voice backend

Copy `.env.example` to `.env.local` and set `VITE_MINDA_API_URL` to the base URL of a backend you control. The client expects:

- `POST /stt` with multipart `file` and `lang`, returning `{ "transcript": "...", "confidence": 0.0 }`.
- `POST /tts` with JSON `{ "text", "lang", "speaker", "pace" }`, returning audio bytes.
- `POST /evaluate` with the authored transcript context, returning feedback fields compatible with `Feedback`.

Provider credentials belong on the backend. A `VITE_` variable is public in the built JavaScript. Backend authentication, validation, rate limiting, privacy, and deployment are not implemented in this repo.

## Checks

```sh
pnpm exec tsc --noEmit
pnpm build
```

There is no configured lint or test command. For manual review, launch the game, complete onboarding, follow the learning path, reload and check local progress, try both microphone and typed conversation input, deny microphone access, and test an unavailable backend URL to confirm fallback behavior. Check the inventory balance before and after a purchase.

## Project conventions

- Keep authored learning content in `src/data/` and state transitions in `src/store/game.ts`.
- Keep browser/backend transport in `src/services/`; do not call AI providers directly from UI components.
- Preserve the local fallback when an optional service is unavailable.
- Avoid adding packages where browser APIs or existing dependencies already cover the need.
- `vite.config.ts` uses the standard Vite React and Tailwind plugins; keep its source alias and configurable base path aligned with deployment needs.
