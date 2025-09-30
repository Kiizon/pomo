import { apiClient } from './api-client';

export type SessionRow = {
  id: number;
  user_id: string;
  started_at: string;         // ISO
  duration_min: number;
  kind: 'work' | 'break';
  created_at: string;
};

// Log a completed work block (default 25m)
export async function logWorkSession(startedAtISO: string, durationMin = 25) {
  return await apiClient.createSession({
    started_at: startedAtISO,
    duration_min: durationMin,
    kind: 'work'
  });
}

// Last N sessions for the signed-in user
export async function fetchRecentSessions(limit = 10): Promise<SessionRow[]> {
  return await apiClient.getRecentSessions(limit);
}

// "Today" total minutes (client timezone; good enough for demo)
export async function fetchTodayTotalMinutes(): Promise<number> {
  return await apiClient.getTodayTotal();
}
