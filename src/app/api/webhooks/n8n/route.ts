import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This is a secure endpoint for n8n to call back into our system
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the request via API Key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const { action, data } = payload;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Handle different actions from n8n
    switch (action) {
      case 'UPDATE_ARTICLE_STATUS':
        if (!data?.articleId || !data?.status) {
          return NextResponse.json({ error: 'Invalid data for UPDATE_ARTICLE_STATUS' }, { status: 400 });
        }
        
        const { error: updateError } = await supabase
          .from('knowledge_articles')
          .update({ status: data.status })
          .eq('id', data.articleId);

        if (updateError) throw updateError;
        
        return NextResponse.json({ success: true, message: `Article ${data.articleId} updated.` });

      case 'LOG_AI_ANALYTICS':
        // If n8n processes some background stuff and wants to log it
        if (!data?.question || !data?.answer) {
          return NextResponse.json({ error: 'Invalid data for LOG_AI_ANALYTICS' }, { status: 400 });
        }
        
        const { error: logError } = await supabase
          .from('ai_analytics')
          .insert([{
            question: data.question,
            answer: data.answer,
            source_type: data.source_type || 'AI',
            response_time_ms: data.response_time_ms || 0
          }]);

        if (logError) throw logError;
        
        return NextResponse.json({ success: true, message: 'Analytics logged.' });

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('n8n Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
