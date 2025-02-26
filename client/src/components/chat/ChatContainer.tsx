import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";
import { type Message } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

interface ChatContainerProps {
  sessionId: string;
}

export function ChatContainer({ sessionId }: ChatContainerProps) {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery<Message[]>({
    queryKey: [`/api/messages/${sessionId}`],
    retry: 3,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      // First, optimistically add the user message
      const newUserMessage: Message = {
        id: Date.now(),
        role: "user",
        content: message,
        timestamp: new Date(),
        sessionId,
        metadata: {}
      };

      queryClient.setQueryData<Message[]>([`/api/messages/${sessionId}`], (old = []) => [
        ...old,
        newUserMessage,
      ]);

      // Add a temporary loading message
      const loadingMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "...",
        timestamp: new Date(),
        sessionId,
        metadata: {}
      };

      queryClient.setQueryData<Message[]>([`/api/messages/${sessionId}`], (old = []) => [
        ...old,
        loadingMessage,
      ]);

      try {
        // Make the API request
        const res = await apiRequest("POST", "/api/chat", { 
          message,
          sessionId 
        });
        const data = await res.json();

        // Remove the loading message
        queryClient.setQueryData<Message[]>([`/api/messages/${sessionId}`], (old = []) => 
          old?.filter(msg => msg.id !== loadingMessage.id)
        );

        return data;
      } catch (error) {
        // If error occurs, remove both messages
        queryClient.setQueryData<Message[]>([`/api/messages/${sessionId}`], (old = []) => 
          old?.filter(msg => msg.id !== loadingMessage.id && msg.id !== newUserMessage.id)
        );
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Failed to load messages. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 md:max-w-4xl h-[calc(100vh-3.5rem)] py-6 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 custom-scrollbar">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded w-3/4 ml-auto" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
            <div className="max-w-sm">
              <h2 className="text-xl font-semibold mb-2">Welcome to ChatGPT Clone</h2>
              <p>Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isLoading={message.content === "..."} 
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 sm:mt-6">
        <ChatInput 
          onSubmit={(message) => mutation.mutate(message)}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}