import { ChatWindow } from '@/components/chat/ChatWindow';
import { createClient } from '@/utils/supabase/server';
import { conversationService } from '@/features/chat/services/conversation.service';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;

  // Create a new conversation for this session
  const conversation = await conversationService.createConversation(user.id, 'New Chat');

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>AI Chatbot</h1>
      <ChatWindow conversationId={conversation.id} />
    </div>
  );
}
