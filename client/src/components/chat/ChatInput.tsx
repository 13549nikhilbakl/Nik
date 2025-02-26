import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSubmit(message);
    setMessage("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="pr-24 resize-none min-h-[80px] md:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button
        size="icon"
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`absolute bottom-4 right-4 transition-all duration-200 ${
          isLoading ? 'opacity-50' : 'hover:scale-105'
        }`}
      >
        <SendHorizontal className="w-4 h-4" />
      </Button>
    </motion.form>
  );
}