import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/features/automation/n8n.service';

export async function POST(request: NextRequest) {
  try {
    const { title, text } = await request.json();

    if (!title || !text) {
      return NextResponse.json({ error: 'Title and text are required' }, { status: 400 });
    }

    const result = await n8nService.triggerAIProcessingQueue(text, title);

    if (!result?.success) {
      throw new Error(result?.error || 'Failed to trigger queue');
    }

    return NextResponse.json({ success: true, message: 'Sent to queue' });
  } catch (error: any) {
    console.error('Queue API error:', error);
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
