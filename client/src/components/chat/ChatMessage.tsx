import { type Message } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex ${isUser ? 'justify-end' : 'justify-center'}`}
    >
      <Card className={`p-4 hover:shadow-lg transition-shadow duration-200 max-w-[80%] ${
        isUser ? 'bg-primary/10' : 'bg-background'
      }`}>
        <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full ${isUser ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            {isUser ? (
              <User className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Bot className="w-5 h-5 text-secondary-foreground" />
            )}
          </div>
          <div className="flex-1 prose dark:prose-invert max-w-none">
            {isLoading ? (
              <div className="flex space-x-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "100ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
              </div>
            ) : (
              <div>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}