// Puter Auth Context — Codex by killarua
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, AIUsage, PuterUser, UsageStats, calcUsageCost } from '@/services/puterService';

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface PuterContextType {
  token: string | null;
  user: PuterUser | null;
  isLoading: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  usageStats: UsageStats;
  storagePermission: 'full' | 'read' | 'none';
  setToken: (token: string) => void;
  setUser: (user: PuterUser) => void;
  logout: () => void;
  createSession: () => string;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  deleteSession: (id: string) => void;
  recordUsage: (usage: AIUsage) => void;
  setStoragePermission: (p: 'full' | 'read' | 'none') => void;
}

export const PuterContext = createContext<PuterContextType | undefined>(undefined);

const MOCK_DAILY = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const tokens = Math.floor(Math.random() * 15000) + 2000;
  return {
    date: d.toISOString().slice(0, 10),
    tokens,
    cost: calcUsageCost(tokens),
  };
});

export function PuterProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<PuterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [storagePermission, setStoragePermission] = useState<'full' | 'read' | 'none'>('none');
  const [usageStats, setUsageStats] = useState<UsageStats>({
    total_tokens: MOCK_DAILY.reduce((a, d) => a + d.tokens, 0),
    prompt_tokens: Math.floor(MOCK_DAILY.reduce((a, d) => a + d.tokens, 0) * 0.6),
    completion_tokens: Math.floor(MOCK_DAILY.reduce((a, d) => a + d.tokens, 0) * 0.4),
    requests: 47,
    cost_usd: MOCK_DAILY.reduce((a, d) => a + d.cost, 0),
    daily: MOCK_DAILY,
  });

  const setToken = useCallback((t: string) => {
    setTokenState(t);
    AsyncStorage.setItem('codex_token', t);
  }, []);

  const setUser = useCallback((u: PuterUser) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setUserState(null);
    AsyncStorage.removeItem('codex_token');
  }, []);

  const createSession = useCallback((): string => {
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  const setActiveSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const addMessage = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s;
        const msgs = [...s.messages, message];
        const title =
          s.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 40)
            : s.title;
        return { ...s, messages: msgs, title, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setActiveSessionId(prev => (prev === id ? null : prev));
  }, []);

  const recordUsage = useCallback((usage: AIUsage) => {
    setUsageStats(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const daily = prev.daily.map(d =>
        d.date === today
          ? { ...d, tokens: d.tokens + usage.total_tokens, cost: d.cost + calcUsageCost(usage.total_tokens) }
          : d
      );
      const hasTodayEntry = daily.some(d => d.date === today);
      const newDaily = hasTodayEntry
        ? daily
        : [...daily.slice(-6), { date: today, tokens: usage.total_tokens, cost: calcUsageCost(usage.total_tokens) }];
      return {
        total_tokens: prev.total_tokens + usage.total_tokens,
        prompt_tokens: prev.prompt_tokens + usage.prompt_tokens,
        completion_tokens: prev.completion_tokens + usage.completion_tokens,
        requests: prev.requests + 1,
        cost_usd: prev.cost_usd + calcUsageCost(usage.total_tokens),
        daily: newDaily,
      };
    });
  }, []);

  return (
    <PuterContext.Provider
      value={{
        token,
        user,
        isLoading,
        sessions,
        activeSessionId,
        usageStats,
        storagePermission,
        setToken,
        setUser,
        logout,
        createSession,
        setActiveSession,
        addMessage,
        deleteSession,
        recordUsage,
        setStoragePermission,
      }}
    >
      {children}
    </PuterContext.Provider>
  );
}
