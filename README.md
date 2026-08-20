# ABIS Socratic Coach

ABIS is a Marketplace-style business simulation with AI-supported Socratic coaching, transparent adaptive assessment, and teacher-facing evaluation logic.

## What this app does

- runs a boardroom-style business decision conversation
- adapts the next question to the learner's reasoning quality
- scores reasoning signals out of 100
- shows a transparent backend layer for assessment logic
- supports teacher-facing judgement of student outcomes

## Core assessment areas

The adaptive learning module evaluates whether the student can:

1. state the decision clearly
2. support it with evidence
3. explain cause and effect
4. identify trade-offs or risks
5. state what would trigger a revision

## Key files

- [app/page.tsx](C:/Users/rvina/OneDrive/Documents/abis-app/app/page.tsx)
- [app/api/boardroom/route.ts](C:/Users/rvina/OneDrive/Documents/abis-app/app/api/boardroom/route.ts)
- [lib/adaptive-learning.ts](C:/Users/rvina/OneDrive/Documents/abis-app/lib/adaptive-learning.ts)
- [ADAPTIVE_LEARNING_DOCUMENTATION.md](C:/Users/rvina/OneDrive/Documents/abis-app/ADAPTIVE_LEARNING_DOCUMENTATION.md)

## Local development

Run:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## AI provider setup

To activate live AI responses, add one of these server-side environment variables:

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=
# Optional. Defaults to openai/gpt-4o-mini.
OPENROUTER_MODEL=openai/gpt-4o-mini
```

You can use [.env.example](C:/Users/rvina/OneDrive/Documents/abis-app/.env.example) as the template.

For OpenRouter, create a key in your OpenRouter account and paste it either in the app's **AI Connection Gateway** under **OpenRouter**, or set `OPENROUTER_API_KEY` in `.env`. Select a model your account can access with `OPENROUTER_MODEL` when needed.

## Documentation

The full explanation of how adaptive learning, scoring, checkpoints, and student outcome judgement work is here:

- [ADAPTIVE_LEARNING_DOCUMENTATION.md](C:/Users/rvina/OneDrive/Documents/abis-app/ADAPTIVE_LEARNING_DOCUMENTATION.md)
