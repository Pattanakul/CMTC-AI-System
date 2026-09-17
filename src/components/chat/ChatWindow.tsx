"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/features/chat/types';

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (content: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { conversationId, role: 'user', content }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content, conversationId })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถตอบคำถามได้');
      }

      setMessages(prev => [...prev, { conversationId, role: 'ai', content: data.answer, sources: data.sources }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          conversationId,
          role: 'ai',
          content: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตอบคำถาม',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className='flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[600px] border rounded-lg p-4 bg-white'>
      <div ref={scrollRef} className='flex-1 overflow-y-auto space-y-4 mb-4'>
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {loading && <div className='text-sm text-gray-500'>AI กำลังตอบ...</div>}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
