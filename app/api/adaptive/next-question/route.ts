import { NextResponse } from 'next/server';
import type { SimulationDecisions } from '@/lib/abis-engine';
import { buildPlayerState } from '@/lib/personalization/player-model';
import { getQuestionBank } from '@/lib/personalization/question-bank';
import { selectQuestion } from '@/lib/personalization/policy';
import type { TelemetryEvent } from '@/lib/personalization/types';

export async function POST(request: Request) {
  try {
    const { events = [], decisions } = await request.json() as { events?: TelemetryEvent[]; decisions?: SimulationDecisions };
    if (!decisions) return NextResponse.json({ error: 'Simulation decisions are required.' }, { status: 400 });
    const playerState = buildPlayerState(events);
    const policyDecision = selectQuestion(playerState, getQuestionBank(decisions), events);
    return NextResponse.json({ playerState, policyDecision });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to select the next question.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

