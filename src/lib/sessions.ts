import { supabase } from './supabaseClient';

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
  const { data: userData, error: uErr } = await supabase.auth.getUser();
  if (uErr) throw uErr;
  const user = userData.user;
  if (!user) throw new Error('Not signed in');

  const { error } = await supabase.from('sessions').insert([{
    user_id: user.id,
    started_at: startedAtISO,
    duration_min: durationMin,
    kind: 'work'
  }]);
  if (error) throw error;
}

// Last N sessions for the signed-in user
export async function fetchRecentSessions(limit = 10): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as SessionRow[];
}

// "Today" total minutes (client timezone; good enough for demo)
export async function fetchTodayTotalMinutes(): Promise<number> {
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date();   end.setHours(23,59,59,999);
  const { data, error } = await supabase
    .from('sessions')
    .select('duration_min, started_at')
    .gte('started_at', start.toISOString())
    .lte('started_at', end.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((sum, r) => sum + (r.duration_min ?? 0), 0);
}
