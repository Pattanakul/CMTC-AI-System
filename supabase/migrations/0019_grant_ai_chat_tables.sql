-- Grant Data API access for AI chat tables.
-- Row Level Security policies still decide which rows authenticated users can access.

GRANT SELECT, INSERT, UPDATE ON public.ai_cache TO authenticated;
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT ON public.ai_analytics TO authenticated;
GRANT SELECT, INSERT ON public.ai_feedback TO authenticated;
