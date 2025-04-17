import { NextResponse } from 'next/server';
import { importAi } from '@/app/api/AiCard/route';

export async function POST(request: Request) {
  try {
    return await importAi(request);
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: 'Failed to process import request' },
      { status: 500 }
    );
  }
}