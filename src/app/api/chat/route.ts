import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { aiGateway } from '@/features/ai/services/gateway.service';
import { cacheService } from '@/features/chat/services/cache.service';
import { conversationService } from '@/features/chat/services/conversation.service';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { question, conversationId, departmentId = 'general' } = await request.json();

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

  // 2. Call n8n via AI Gateway
  try {
    const aiResponse = await aiGateway.processQuestion(question, user.id, departmentId, conversationId);
    
    // 3. Save Cache & Message
    await cacheService.saveCache(question, aiResponse.answer, aiResponse.confidenceScore);
    await conversationService.saveMessage({
      conversationId,
      role: 'ai',
      content: aiResponse.answer,
      sources: aiResponse.sources,
      confidenceScore: aiResponse.confidenceScore
    });

    return NextResponse.json({
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      confidence: aiResponse.confidenceScore,
      responseTime: aiResponse.duration, // Using duration from gateway
      conversationId
    });
  } catch {
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
