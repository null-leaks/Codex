// AI Chat logic hook — Codex by killarua
import { useState, useCallback } from 'react';
import { usePuter } from '@/hooks/usePuter';
import { puterChat, ChatMessage } from '@/services/puterService';

export function useAIChat() {
  const { token, activeSessionId, sessions, addMessage, recordUsage, createSession } = usePuter();
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setError(null);

      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = createSession();
      }

      const userMsg: ChatMessage = { role: 'user', content: text.trim() };
      addMessage(sessionId, userMsg);

      if (!token) {
        addMessage(sessionId, {
          role: 'assistant',
          content:
            'Please login with your Puter account to use the AI. Tap the login button on the chat screen.',
        });
        return;
      }

      setIsTyping(true);
      try {
        const history: ChatMessage[] = [
          {
            role: 'system',
            content:
              'You are Codex, an advanced AI assistant built by killarua. Be helpful, concise, and insightful.',
          },
          ...(activeSession?.messages || []),
          userMsg,
        ];

        const { content, usage } = await puterChat(history, token);
        addMessage(sessionId, { role: 'assistant', content });
        recordUsage(usage);
      } catch (err: any) {
        setError(err.message || 'AI request failed');
        addMessage(sessionId, {
          role: 'assistant',
          content: `Error: ${err.message || 'Failed to get response. Please try again.'}`,
        });
      } finally {
        setIsTyping(false);
      }
    },
    [token, activeSessionId, activeSession, addMessage, recordUsage, createSession]
  );

  return {
    messages: activeSession?.messages || [],
    isTyping,
    error,
    sendMessage,
    sessionTitle: activeSession?.title || 'New Chat',
  };
}
