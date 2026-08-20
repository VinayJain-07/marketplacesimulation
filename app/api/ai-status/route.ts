import { NextResponse } from 'next/server';

type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export async function GET() {
  const providers: Record<AiProvider, boolean> = {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    openrouter: Boolean(process.env.OPENROUTER_API_KEY?.trim())
  };

  const preferredProvider = (['openrouter', 'gemini', 'openai', 'anthropic'] as AiProvider[]).find((provider) => providers[provider]) ?? null;

  return NextResponse.json({
    providers,
    hasAnyProvider: Boolean(preferredProvider),
    preferredProvider
  });
}
