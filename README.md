# MINDA (മിണ്ട്)

**Don't just learn. Speak.**

MINDA is a voice-first language-learning game for people who need practical confidence in everyday conversations, including travellers and people settling into a new community. Vocabulary drills can teach words, but learners also need a safe place to hear, say, and retry useful phrases in context.

## The experience

Players explore a 3D Kerala-inspired town and practise everyday situations through a sequence of locations and missions. Each learning unit offers word practice, sentence practice, a conversation, and a challenge. NPCs speak the target language; the learner can answer through a microphone or type, then receive concept-based feedback and try again. Progress, settings, conversation history, and rewards are saved in the browser on the current device.

Voice is central to the practice loop: listen to a phrase, speak it, review what was understood, and repeat. MINDA supports browser speech recognition and speech synthesis when available, and provides typed input or pronunciation-guide playback as fallbacks. An optional server endpoint can provide speech recognition, generated audio, and contextual evaluation. The app does not include that server implementation or provider credentials.

## Core features

- Interactive 3D world with location discovery and progressive missions.
- Word, sentence, conversation, and challenge activities.
- Microphone input with live level feedback and a typed fallback.
- Target-language audio with browser-native, approximate pronunciation, or optional backend playback.
- Concept-based local response evaluation; optional remote evaluation with local fallback.
- Persistent local profile, learning progress, conversation history, streaks, achievements, and coin inventory.
- Optional hints and cosmetic purchases; purchases show their price and fail when the balance is insufficient.
- English, Malayalam, and Hindi interface translations.

## User journey

1. Choose a learner profile, interface language, target language, and difficulty.
2. Enter the world and follow the available location and mission progression.
3. Practise words and useful sentences, then speak or type during an NPC conversation.
4. Review feedback, retry, and complete activities to save progress and earn rewards.
5. Return on the same browser and device to continue from the locally saved profile.

The game currently models a Kerala town and includes other region artwork, but the full set of listed locations and the daily activity loop should be checked in the running demo before claiming complete coverage.

## Technical architecture

- **UI:** React 19, TypeScript, Tailwind CSS v4, and Framer Motion.
- **World:** Three.js through React Three Fiber and Drei; game systems handle input, collision, travel, and time.
- **State:** Zustand with browser local-storage persistence.
- **Voice:** Browser `SpeechRecognition` / `webkitSpeechRecognition`, `MediaRecorder` for the optional backend path, Web Audio microphone metering, and `speechSynthesis` for browser playback.
- **Evaluation:** Local concept and variant matching in `src/services/ai/evaluate.ts`. If configured, `/evaluate` delegates to a server that may use Gemini; the server and its prompt are outside this repository.
- **Optional backend:** `VITE_MINDA_API_URL` configures `/stt`, `/tts`, and `/evaluate` endpoints. The documented Sarvam and Gemini provider choices describe the expected backend contract, not integrations shipped in this frontend.
- **Build:** Vite 8, React plugin, Tailwind CSS plugin, and the current pnpm lockfile.

## Requirements and setup

Use Node.js compatible with the Vite 8 toolchain and pnpm. The repository includes `.mise.toml` for the intended toolchain.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server defaults to port `8443`; `PORT` can set another port. For optional server-backed speech and evaluation, copy `.env.example` to `.env.local` and set `VITE_MINDA_API_URL` to a trusted backend base URL. The backend must implement the contracts described in `src/services/config.ts`. Do not place API keys or private credentials in frontend environment variables; any `VITE_` value is included in the browser bundle.

## Build and checks

```sh
pnpm build
pnpm exec tsc --noEmit
```

There is no lint or automated test script configured in this repository. See [Development](docs/DEVELOPMENT.md) for commands and manual review guidance.

## Known limitations

- There is no server, Supabase schema, authentication, or cross-device progress sync in this repository; browser storage is user-editable and is not a secure source of truth for rewards.
- Cloud STT, TTS, remote AI evaluation, and persistence require a separately deployed backend. The frontend does not contain provider SDKs or credentials.
- Browser speech recognition varies by browser, language, and permissions; typed answers remain available.
- Local evaluation matches authored concepts and variants. It is a useful demo fallback, not a general language understanding model, pronunciation analysis, or proof of fluency.
- The interface has a 1024px minimum width and is currently aimed at desktop/laptop browsers.
- The project does not currently configure automated tests or linting.

## Future improvements

- Implement and document an authenticated backend with validated inputs, rate limits, persistent user progress, and server-authoritative rewards.
- Add automated tests for progression, evaluation, persistence, and purchases.
- Complete and verify the daily lesson and location progression against the intended learning journey.
- Improve narrow-screen support, accessibility checks, and browser/device coverage for speech input.
- Add an operational demo backend with clearly disclosed model/provider behavior and privacy handling.
