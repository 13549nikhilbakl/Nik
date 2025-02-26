import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { chatRequestSchema } from "@shared/schema";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "1f08ff40641531842bc758c0d225419499540642a262a615ac8bd7b327288e61";

export async function registerRoutes(app: Express) {
  app.get("/api/messages/:sessionId", async (req, res) => {
    const messages = await storage.getMessagesBySession(req.params.sessionId);
    res.json(messages);
  });

  app.get("/api/sessions", async (_req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.post("/api/chat", async (req, res) => {
    const result = chatRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const userMessage = await storage.createMessage({
      role: "user",
      content: result.data.message,
      sessionId: result.data.sessionId,
      metadata: { timestamp: new Date().toISOString() }
    });

    try {
      // Get all previous messages for context
      const messages = await storage.getMessagesBySession(result.data.sessionId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system message for better context
      const systemMessage = {
        role: "system",
        content: "You are a helpful AI assistant. Always provide clear, concise, and accurate responses. If you're not sure about something, say so. Format your responses using markdown when appropriate for better readability."
      };

      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          messages: [systemMessage, ...conversationHistory],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      console.log("AI API Response:", data); // Debug log

      if (!response.ok || !data.choices?.[0]?.message?.content) {
        throw new Error(data.error || "Invalid API response");
      }

      const aiMessage = await storage.createMessage({
        role: "assistant",
        content: data.choices[0].message.content,
        sessionId: result.data.sessionId,
        metadata: { 
          timestamp: new Date().toISOString(),
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          tokens: data.usage?.total_tokens
        }
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      console.error("AI API error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  return createServer(app);
}