import { redirect } from 'next/navigation';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { createClient } from '@/utils/supabase/server';
import { conversationService } from '@/features/chat/services/conversation.service';

interface ChatPageContentProps {
  title?: string;
}

export async function ChatPageContent({ title = 'แชท AI' }: ChatPageContentProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let conversationId = crypto.randomUUID();

  try {
    const conversation = await conversationService.createConversation(user.id, 'New Chat');
    conversationId = conversation.id;
  } catch (error) {
    console.warn('Unable to create persisted conversation, using temporary chat session:', error);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">ถามข้อมูลประชาสัมพันธ์และเอกสารในระบบ</p>
      </div>
      <ChatWindow conversationId={conversationId} />
    </div>
  );
}
