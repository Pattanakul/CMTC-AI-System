import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

type KnowledgeArticle = {
  id: string;
  title: string;
  question: string | null;
  answer: string | null;
  summary: string | null;
  content: string | null;
  source: string | null;
  slug: string | null;
};

const DEFAULT_SEARCH_LIMIT = 5;
const MAX_CONTEXT_CHARACTERS = 1800;
const KNOWLEDGE_NOT_FOUND_ANSWER =
  'ตอนนี้ยังไม่มีข้อมูลนี้ในระบบ กรุณาติดต่อวิทยาลัย โทร 053 217 708 ครับ';

function clampSearchLimit(limit: unknown) {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) {
    return DEFAULT_SEARCH_LIMIT;
  }

  return Math.min(Math.max(Math.floor(limit), 1), 10);
}

function getExcerpt(content: string | null) {
  if (!content) return '';

  return content.length > MAX_CONTEXT_CHARACTERS
    ? `${content.slice(0, MAX_CONTEXT_CHARACTERS)}...`
    : content;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function articleText(article: KnowledgeArticle) {
  return [
    article.title,
    article.question,
    article.answer,
    article.summary,
    article.content,
    article.source,
  ].filter(Boolean).join('\n');
}

function rankKnowledgeArticles(articles: KnowledgeArticle[], message: string, limit: number) {
  const normalizedMessage = normalizeText(message);
  const words = normalizedMessage.split(' ').filter((word) => word.length > 1);

  return articles
    .map((article) => {
      const title = normalizeText(article.title);
      const question = normalizeText(article.question || '');
      const text = normalizeText(articleText(article));
      let score = 0;

      if (title && normalizedMessage.includes(title)) score += 8;
      if (title && title.includes(normalizedMessage)) score += 8;
      if (question && normalizedMessage.includes(question)) score += 6;
      if (question && question.includes(normalizedMessage)) score += 6;

      for (const word of words) {
        if (title.includes(word)) score += 3;
        if (question.includes(word)) score += 2;
        if (text.includes(word)) score += 1;
      }

      return { article, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

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

    const supabase = createAdminClient();

    // 2. Handle different actions from n8n
    switch (action) {
      case 'FACEBOOK_KNOWLEDGE_SEARCH': {
        const message = data?.message || data?.question || data?.text;

        if (!message || typeof message !== 'string') {
          return NextResponse.json({ error: 'Invalid data for FACEBOOK_KNOWLEDGE_SEARCH' }, { status: 400 });
        }

        const limit = clampSearchLimit(data?.limit);
        const { data: articles, error: articleError } = await supabase
          .from('knowledge_articles')
          .select('id,title,question,answer,summary,content,source,slug')
          .eq('is_publish', true)
          .is('deleted_at', null)
          .limit(50);

        if (articleError) throw articleError;

        const rankedArticles = rankKnowledgeArticles(
          (articles || []) as KnowledgeArticle[],
          message,
          limit
        );

        if (rankedArticles.length === 0) {
          return NextResponse.json({
            success: true,
            hasAnswer: false,
            query: message,
            answer: KNOWLEDGE_NOT_FOUND_ANSWER,
            results: [],
            context: '',
            message: 'No matching knowledge articles found.',
          });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
        const results = rankedArticles
          .map(({ article, score }) => {
            return {
              id: article.id,
              title: article.title,
              answer: article.answer,
              summary: article.summary,
              excerpt: getExcerpt(article.content || article.answer),
              slug: article.slug,
              url: appUrl && article.slug ? `${appUrl}/articles/${article.slug}` : null,
              score,
            };
          })

        const context = results
          .map((article, index) =>
            [
              `Source ${index + 1}: ${article.title}`,
              article.answer ? `Answer: ${article.answer}` : null,
              article.summary ? `Summary: ${article.summary}` : null,
              article.excerpt ? `Content: ${article.excerpt}` : null,
              article.url ? `URL: ${article.url}` : null,
            ]
              .filter(Boolean)
              .join('\n')
          )
          .join('\n\n');
        const bestAnswer = results.find((article) => article.answer)?.answer || '';

        return NextResponse.json({
          success: true,
          hasAnswer: Boolean(bestAnswer),
          query: message,
          answer: bestAnswer,
          results,
          context,
        });
      }

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

  } catch (error: unknown) {
    console.error('n8n Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
