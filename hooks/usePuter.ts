// usePuter hook — Codex by killarua
import { useContext } from 'react';
import { PuterContext } from '@/contexts/PuterContext';

export function usePuter() {
  const ctx = useContext(PuterContext);
  if (!ctx) throw new Error('usePuter must be used within PuterProvider');
  return ctx;
}
