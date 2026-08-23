import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cacheService } from '@/features/chat/services/cache.service';
import { conversationService } from '@/features/chat/services/conversation.service';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { question, conversationId, departmentId = 'general' } = await request.json();
  const startTime = Date.now();

  // 1. Search Cache
  const cached = await cacheService.searchCache(question);
  if (cached) {
    await conversationService.saveMessage({
      conversationId,
      role: 'ai',
      content: cached.answer,
      sources: []
    });
    return NextResponse.json({ 
        answer: cached.answer, 
        sources: [], 
        confidence: cached.confidence_score, 
        responseTime: 0,
        conversationId 
    });
  }

  // 2. Direct OpenAI Call (Temporary until n8n is set up in Milestone 5)
  try {
    // Fetch previous messages for context
    const previousMessages = await conversationService.getMessages(conversationId);
    
    // Optionally fetch relevant context using pgvector here (simplified for now)

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are a helpful AI assistant for the CMTC organization. Be concise and polite.`,
      messages: [
        ...previousMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: question }
      ]
    });

    const duration = Date.now() - startTime;
    const confidenceScore = 0.9; // placeholder
    
    // 3. Save Cache & Message
    await cacheService.saveCache(question, text, confidenceScore);
    await conversationService.saveMessage({
      conversationId,
      role: 'ai',
      content: text,
      sources: [],
      confidenceScore: confidenceScore
    });

    // Also log analytics directly
    await supabase.from('ai_analytics').insert([{
      question,
      answer: text,
      response_time_ms: duration,
      confidence_score: confidenceScore,
      source_type: 'AI'
    }]);

    return NextResponse.json({
      answer: text,
      sources: [],
      confidence: confidenceScore,
      responseTime: duration,
      conversationId
    });
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}

