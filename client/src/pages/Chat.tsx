import { ChatContainer } from "@/components/chat/ChatContainer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Header } from "@/components/Header";
import { Background } from "@/components/Background";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Chat() {
  const [currentSession, setCurrentSession] = useState(() => 
    new Date().toISOString()
  );

  const handleNewChat = () => {
    setCurrentSession(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Background />
      <Header />
      <motion.div 
        className="flex flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChatSidebar 
          currentSession={currentSession}
          onNewChat={handleNewChat}
          onSelectSession={setCurrentSession}
        />
        <main className="flex-1">
          <ChatContainer sessionId={currentSession} />
        </main>
      </motion.div>
    </div>
  );
}