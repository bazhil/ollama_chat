"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          {/* Optional: Add an image source if you have one */}
          {/* <AvatarImage src="/path/to/ai-avatar.png" alt="AI Avatar" /> */}
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground" // Teal bubble for user
            : "bg-secondary text-secondary-foreground" // Lighter gray bubble for AI
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
       {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
           {/* Optional: Add an image source if you have one */}
          {/* <AvatarImage src="/path/to/user-avatar.png" alt="User Avatar" /> */}
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
