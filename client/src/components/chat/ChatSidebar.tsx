import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface ChatSidebarProps {
  currentSession: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
}

export function ChatSidebar({ currentSession, onNewChat, onSelectSession }: ChatSidebarProps) {
  const { data: sessions = [] } = useQuery<string[]>({
    queryKey: ["/api/sessions"],
  });

  return (
    <motion.div 
      className="w-64 border-r bg-muted/20 h-[calc(100vh-3.5rem)] p-4 hidden md:block"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <Button 
        className="w-full mb-4" 
        onClick={onNewChat}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="space-y-2">
          {sessions.map((sessionId) => (
            <Button
              key={sessionId}
              variant={sessionId === currentSession ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectSession(sessionId)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="truncate">
                {format(new Date(sessionId), "MMM d, h:mm a")}
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
