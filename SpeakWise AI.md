# SpeakWise AI

SpeakWise AI is a local-first English communication coach designed to help learners turn practice into measurable improvement. The product combines text feedback, speech metrics, personalized exercises, progress tracking, and a calm, focused learning experience.

> **Project status:** The current build is a tested MVP and demonstration platform. The core learning loop is functional with deterministic analysis and demo data. External LLM, phoneme-level pronunciation, persistent learning history, and optional authentication are designed as extension points rather than silently simulated as production capabilities.

## Product direction

SpeakWise is organized around one learning loop:

```text
Input → Analyze → Explain → Practice → Remember patterns → Measure improvement
```

The primary differentiator is the connection between a learner's recurring errors and the next recommended practice. The product is intended for college students, English learners, interview preparation, presentation preparation, and anyone who wants more natural spoken communication.

## Current MVP capabilities

The implemented MVP includes the following capabilities:

- Responsive dashboard with daily goal, streak, XP, communication snapshot, word of the day, practice recommendations, common errors, and achievements.
- Text analysis with deterministic grammar checks, grammar explanations, vocabulary repetition detection, sentence metrics, natural alternatives, and advanced alternatives.
- Speech analysis using transcript input and browser speech recognition where supported. The analyzer returns words per minute, long-pause estimates, filler-word counts, and text feedback.
- Personal Error Profile with recurring grammar categories and speech-pattern indicators.
- Rule-based adaptive exercises with answer validation and XP rewards.
- Learning path and Word of the Day views.
- Conversation Mode using a scenario-aware demo adapter. The adapter is ready to be replaced with an OpenAI-compatible provider.
- Progress view with component scores and a practice trend visualization.
- Seeded leaderboard data that is explicitly labeled as demo data.
- Profile and privacy surfaces that explain the temporary-audio policy.
- Mobile navigation and responsive layouts for small screens.

Pronunciation scoring is deliberately provider-gated. The interface does not claim phoneme accuracy unless a configured pronunciation service returns reliable phoneme-level data. Composite communication scores are also deferred until component metrics have been validated.

## Technology

The current WebDev project uses the following runtime stack:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Wouter, Lucide icons.
- **Application server:** Node.js, Express, tRPC, Zod, and TypeScript.
- **Data layer:** Drizzle ORM with the WebDev database scaffold. The current MVP uses deterministic demo data in the feature procedures while the persistence model is extended.
- **Testing:** Vitest and TypeScript checks.
- **Optional AI sidecar:** Python dependencies are listed in [`requirements.txt`](./requirements.txt) for a future local speech/NLP service. The current Node application does not start a Python process automatically.

The original product brief described a React/Vite frontend with a FastAPI and SQLite backend. The managed WebDev scaffold provides an equivalent full-stack development environment with a Node/tRPC server and database/auth infrastructure. The application code keeps provider and persistence boundaries explicit so the Python/FastAPI sidecar and future SQLite-first local workflow can be added without coupling them to the UI.

## Repository structure

```text
speakwise-ai/
├── client/
│   ├── index.html
│   └── src/
│       ├── components/       # Shared layout and UI primitives
│       ├── contexts/         # Theme and application contexts
│       ├── pages/
│       │   └── Home.tsx      # Main SpeakWise experience and views
│       ├── lib/trpc.ts       # Typed client binding
│       ├── App.tsx           # Application routes and providers
│       └── index.css         # Brand tokens, layout styles, and motion
├── server/
│   ├── _core/                # WebDev runtime infrastructure
│   ├── routers.ts            # Auth and SpeakWise tRPC procedures
│   ├── db.ts                 # Database helpers
│   ├── speakwise.test.ts     # SpeakWise feature tests
│   └── auth.logout.test.ts   # Auth regression test
├── drizzle/                  # Database schema and migrations
├── shared/                   # Shared constants and types
├── requirements.txt          # Optional Python speech/NLP sidecar dependencies
├── package.json
└── README.md
```

## Prerequisites

For the current WebDev application, install:

- Node.js 22 or a compatible current Node.js LTS release.
- pnpm 10 or a compatible pnpm release.
- Git.

Python 3.11 or newer is required only when the optional speech/NLP sidecar is being developed. The current MVP can be run without Python.

## Installation

Clone the repository and install the JavaScript dependencies:

```bash
git clone <repository-url>
cd speakwise-ai
pnpm install
```

Create a local environment file when provider integrations or managed authentication are needed. Never commit secrets:

```bash
cp .env.example .env
```

If `.env.example` is not present in your checkout, create `.env` from the variables supplied by the WebDev environment and add only the provider keys you have configured. Common optional variables include:

```dotenv
OPENAI_API_KEY=your_openai_compatible_key
OPENAI_BASE_URL=https://your-compatible-provider.example/v1
OPENAI_MODEL=your-model-name
PRONUNCIATION_PROVIDER_API_KEY=your_pronunciation_provider_key
```

The current demo flow does not require these provider keys. Missing providers should remain visible as unavailable or experimental rather than producing fabricated scores.

## Run the application

Start the development server:

```bash
pnpm dev
```

The managed WebDev runtime exposes the application through its preview URL. In a standard local process, the server listens on the port configured by the WebDev template, commonly `3000`. The browser UI includes all MVP sections under the single-page application shell.

Useful commands:

```bash
pnpm check       # TypeScript validation
pnpm test        # Vitest test suite
pnpm build       # Production frontend and server build
pnpm format      # Format project files with Prettier
pnpm db:push     # Generate and apply Drizzle migrations when persistence is enabled
```

## Optional Python speech/NLP sidecar

The Python requirements file prepares a separate service for local speech transcription and language analysis. It is intentionally not invoked by `pnpm dev` in the current MVP.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

A future sidecar can expose endpoints such as `/health`, `/transcribe`, and `/analyze` and be called through a typed server-side adapter. Raw audio should be accepted only for the duration of processing by default. If a learner explicitly saves a result, persist the transcript and derived metrics rather than the recording itself.

The Whisper dependency may require a compatible PyTorch build and an `ffmpeg` installation. Keep those system-level requirements documented for the target operating system before enabling local transcription in production.

## Feature API surface

The current typed tRPC procedures are grouped under `speakwise`:

| Procedure | Purpose |
| --- | --- |
| `speakwise.dashboard` | Return dashboard cards, practice recommendations, streak, XP, and word of the day. |
| `speakwise.analyzeText` | Analyze text for grammar, repeated vocabulary, sentence metrics, and rewrites. |
| `speakwise.speechMetrics` | Add speech duration, words per minute, pause estimates, filler counts, and provider-gated pronunciation status. |
| `speakwise.profile` | Return component scores, recurring errors, and speech patterns. |
| `speakwise.exercises` | Return adaptive exercise items. |
| `speakwise.submitExercise` | Validate an exercise answer and award demo XP. |
| `speakwise.conversation` | Return a scenario-aware conversation response from the demo adapter. |
| `speakwise.leaderboard` | Return clearly labeled seeded demo participants. |

All inputs are validated with Zod. The server should remain the only place where provider credentials are read or external AI requests are made.

## Analysis and scoring policy

SpeakWise uses transparent application metrics rather than official English proficiency certification. Text analysis returns component scores for grammar, vocabulary, fluency, and naturalness. Speech analysis adds words per minute, estimated long pauses, and filler counts. A composite score is intentionally deferred until the component metrics have been validated against real sessions.

The current deterministic analyzer recognizes a small set of high-value grammar patterns, including past-tense mistakes, subject–verb agreement, article-like patterns, and unnecessary prepositions. It is a foundation for a broader analysis engine, not a complete grammar authority. LLM-generated explanations and rewrites must be schema-validated and should always have a deterministic fallback.

## Privacy and safety expectations

SpeakWise should follow these rules as the product becomes more capable:

1. Delete raw recordings after analysis by default.
2. Retain transcripts, derived metrics, and user-approved results only when needed for learning history.
3. Never log passwords, API keys, raw secrets, or unnecessary personal information.
4. Keep external provider calls behind server-side adapters.
5. Mark seeded data, mock responses, experimental pronunciation feedback, and unavailable providers clearly in the UI.
6. Do not describe application metrics as standardized test scores or certification results.

## Testing

Run the complete validation set before handing off a change:

```bash
pnpm check
pnpm test
pnpm build
```

The current suite covers authentication logout behavior, grammar detection, natural rewrites, speech metrics, provider-gated pronunciation status, exercise validation, and scenario-aware conversation responses.

## Roadmap

The recommended next increments are:

1. Add persistent learning-session, error-history, exercise-attempt, XP, streak, and achievement tables.
2. Introduce optional user authentication while preserving the demo profile flow.
3. Add an OpenAI-compatible adapter for explanations, rewrites, conversation, and exercise variants.
4. Add a phoneme-level pronunciation provider adapter with explicit capability checks.
5. Add a Python/FastAPI sidecar for local Whisper transcription and richer NLP services.
6. Replace seeded leaderboard entries with authenticated, privacy-aware cohort rankings.
7. Add integration tests for the provider adapters and audio lifecycle.

## License

This project is licensed under the MIT License unless the repository owner specifies another license.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://vite.dev/ "Vite documentation"
[3]: https://trpc.io/ "tRPC documentation"
[4]: https://fastapi.tiangolo.com/ "FastAPI documentation"
[5]: https://github.com/openai/whisper "OpenAI Whisper repository"
[6]: https://orm.drizzle.team/ "Drizzle ORM documentation"
