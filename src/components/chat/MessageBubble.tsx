import { ChatMessage } from "@/features/chat/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai";
  const containerClass = isAi ? "flex justify-start" : "flex justify-end";
  const bubbleClass = isAi 
    ? "p-3 rounded-lg max-w-[80%] bg-gray-100" 
    : "p-3 rounded-lg max-w-[80%] bg-blue-600 text-white";
  
  return (
    <div className={containerClass}>
      <div className={bubbleClass}>
        {message.content}
      </div>
    </div>
  );
}
