"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, type Message } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { sendMessageToOllama } from './actions'; // Import server action

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
         scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Call the server action
      const response = await sendMessageToOllama(content);
      if (response.success && response.message) {
        const aiMessage: Message = { role: 'assistant', content: response.message };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Handle error from server action
        const errorMessage: Message = { role: 'assistant', content: response.error || "Sorry, I couldn't process that." };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { role: 'assistant', content: "An error occurred. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
       // Ensure scroll happens after state update and potential re-render
       requestAnimationFrame(scrollToBottom);
    }
  };


  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 md:p-8">
       <Card className="w-full max-w-2xl h-[calc(100vh-4rem)] flex flex-col shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-center text-xl font-semibold">Ollama Chat (deepseek-r1)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                   <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                   <Skeleton className="h-10 w-3/4 rounded-lg" />
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
         <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </Card>
    </div>
  );
}
