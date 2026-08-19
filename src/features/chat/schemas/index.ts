import { z } from 'zod';

export const ChatMessageInputSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().uuid().optional(),
});

export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;
