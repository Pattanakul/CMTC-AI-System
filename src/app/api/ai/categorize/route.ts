import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { llmService } from '@/features/ai/services/llm.service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, existingCategories } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const categoryNames = existingCategories
      .map((category: { name: string }) => category.name)
      .join(', ');

    const object = await llmService.suggestArticleCategory({
      text,
      categoryNames,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Categorize API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI processing failed' },
      { status: 500 }
    );
  }
}
