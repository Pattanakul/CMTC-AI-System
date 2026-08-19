import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  sources: z.array(z.any()).optional(),
  confidenceScore: z.number().optional(),
  createdAt: z.date().optional(),
});

export const ConversationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  title: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
