// Puter.js service layer — Codex by killarua
// Uses Puter REST API compatible with puter.js SDK patterns

const PUTER_API = 'https://api.puter.com';
const AI_MODEL = 'cognitivecomputations/dolphin-mistral-24b-venice-edition';

export interface PuterUser {
  uuid: string;
  username: string;
  email?: string;
  is_pro?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface PuterFile {
  id: string;
  name: string;
  path: string;
  size: number;
  modified: string;
  is_dir: boolean;
  type?: string;
}

// Auth
export async function puterGetAuthURL(): Promise<string> {
  return `https://puter.com/action/sign-in?embedded=true&return_url=${encodeURIComponent('codex://auth-callback')}`;
}

export async function puterGetUser(token: string): Promise<PuterUser> {
  const res = await fetch(`${PUTER_API}/whoami`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Auth failed');
  return res.json();
}

// AI Chat
export async function puterChat(
  messages: ChatMessage[],
  token: string,
  onChunk?: (text: string) => void
): Promise<{ content: string; usage: AIUsage }> {
  const res = await fetch(`${PUTER_API}/drivers/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      interface: 'puter-chat-completion',
      method: 'complete',
      args: {
        messages,
        model: AI_MODEL,
        stream: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI error: ${err}`);
  }

  const data = await res.json();
  const content =
    data?.result?.message?.content ||
    data?.result?.choices?.[0]?.message?.content ||
    'No response';

  const usage: AIUsage = data?.result?.usage || {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  if (onChunk) onChunk(content);
  return { content, usage };
}

// File System
export async function puterListFiles(
  path: string,
  token: string
): Promise<PuterFile[]> {
  const res = await fetch(`${PUTER_API}/readdir`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to list files');
  const data = await res.json();
  return (data || []).map((f: any) => ({
    id: f.id || f.uid || String(Math.random()),
    name: f.name,
    path: f.path || `${path}/${f.name}`,
    size: f.size || 0,
    modified: f.modified || new Date().toISOString(),
    is_dir: f.is_dir || f.type === 'dir',
    type: f.type,
  }));
}

export async function puterReadFile(
  path: string,
  token: string
): Promise<string> {
  const res = await fetch(`${PUTER_API}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to read file');
  return res.text();
}

export async function puterWriteFile(
  path: string,
  content: string,
  token: string
): Promise<void> {
  const res = await fetch(`${PUTER_API}/write`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) throw new Error('Failed to write file');
}

export async function puterDeleteFile(
  path: string,
  token: string
): Promise<void> {
  const res = await fetch(`${PUTER_API}/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to delete file');
}

export async function puterCreateFolder(
  path: string,
  token: string
): Promise<void> {
  const res = await fetch(`${PUTER_API}/mkdir`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  });
  if (!res.ok) throw new Error('Failed to create folder');
}

// Usage stats (mocked realistic structure)
export interface UsageStats {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  requests: number;
  cost_usd: number;
  daily: { date: string; tokens: number; cost: number }[];
}

export function calcUsageCost(tokens: number): number {
  // dolphin-mistral approximate pricing
  return (tokens / 1_000_000) * 0.8;
}
