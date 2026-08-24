export const n8nService = {
  async triggerArticlePublished(articleId: string, title: string, authorId: string) {
    const webhookUrl = process.env.N8N_ARTICLE_PUBLISHED_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('N8N_ARTICLE_PUBLISHED_WEBHOOK_URL is not configured. Skipping webhook.');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.N8N_API_KEY || '',
        },
        body: JSON.stringify({
          event: 'article.published',
          articleId,
          title,
          authorId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('n8n Webhook failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error triggering n8n webhook:', error);
    }
  },

  async triggerAIProcessingQueue(text: string, title: string) {
    const webhookUrl = process.env.N8N_AI_PROCESSING_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('N8N_AI_PROCESSING_WEBHOOK_URL is not configured. Skipping processing queue.');
      return { success: false, error: 'Webhook URL not configured' };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.N8N_API_KEY || '',
        },
        body: JSON.stringify({
          event: 'article.process_ai',
          title,
          content: text,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n returned status ${response.status}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error sending to AI processing queue:', error);
      return { success: false, error: error.message };
    }
  }
};
