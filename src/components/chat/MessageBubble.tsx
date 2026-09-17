import { ChatMessage } from "@/features/chat/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === "ai";
  const containerClass = isAi ? "flex justify-start" : "flex justify-end";
  const bubbleClass = isAi 
    ? "p-2.5 rounded-lg max-w-[80%] bg-gray-100 whitespace-pre-wrap break-words leading-normal text-sm" 
    : "p-2.5 rounded-lg max-w-[80%] bg-blue-600 text-white whitespace-pre-wrap break-words leading-normal text-sm";
  
  return (
    <div className={containerClass}>
      <div className={bubbleClass}>
        {message.content}
      </div>
    </div>
  );
}
