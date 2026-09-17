import { createClient } from '@/utils/supabase/server';

export const aiGateway = {
  async processQuestion(question: string, userId: string, departmentId: string, conversationId: string) {
    const url = process.env.N8N_API_URL || process.env.N8N_WEBHOOK_URL;
    if (!url) throw new Error('n8n URL not configured');

    const startTime = Date.now();
    
    // 1. Prepare Payload
    const payload = { question, userId, departmentId, conversationId };

    // 2. Forward to n8n
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': process.env.N8N_API_KEY! },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('AI Service connection failed');
    const result = await response.json();

    // 3. Log Analytics
    const duration = Date.now() - startTime;
    await this.logAnalytics(question, result.answer, duration, result.confidenceScore);

    return { ...result, duration };
  },

  async logAnalytics(question: string, answer: string, duration: number, confidence: number) {
    const supabase = await createClient();
    await supabase.from('ai_analytics').insert([{
      question,
      answer,
      response_time_ms: duration,
      confidence_score: confidence,
      source_type: 'AI'
    }]);
  }
};
