import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, existingCategories } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const categoryNames = existingCategories.map((c: any) => c.name).join(', ');

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        suggestedCategory: z.string().describe('The best matching category from the provided list, or a new one if none fit.'),
        suggestedSummary: z.string().describe('A concise 1-2 sentence summary of the text.'),
      }),
      prompt: `Analyze the following article text and suggest a category and a short summary.
      
      Available Categories: ${categoryNames || 'None yet'}
      
      Article Text:
      ${text}
      `,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Categorize API error:', error);
    return NextResponse.json({ error: error.message || 'AI processing failed' }, { status: 500 });
  }
}
