import { NextRequest, NextResponse } from 'next/server';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { query, limit = 5 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Generate embedding for the search query
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    // Call Postgres function to match articles
    // Requires pgvector and the match_articles function from migration 0012
    const { data: articles, error } = await supabase.rpc('match_articles', {
      query_embedding: embedding,
      match_threshold: 0.3, // Adjust this threshold based on desired strictness
      match_count: limit,
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      throw error;
    }

    return NextResponse.json({ results: articles });
  } catch (error: any) {
    console.error('Semantic Search API error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
