export function getAccessToken(): string | null {
  try {
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (!sessionStr) return null;
    const session = JSON.parse(sessionStr);
    return session?.currentSession?.access_token || null;
  } catch (error) {
    console.error('Error parsing supabase auth token from localStorage:', error);
    return null;
  }
}
