const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').trim();

export const getSessionId = (): string | null => {
  return localStorage.getItem('careerpilot_session_id');
};

export const setSessionId = (sessionId: string) => {
  localStorage.setItem('careerpilot_session_id', sessionId);
};

export const clearSession = () => {
  localStorage.removeItem('careerpilot_session_id');
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session_id = getSessionId();
  
  let path = endpoint;
  if (session_id) {
    path = endpoint.replace('{session_id}', session_id);
  }
  
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMsg = `Request failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errorMsg;
      } catch {
        // Fallback if not JSON
      }
      throw new Error(errorMsg);
    }
    
    return await response.json() as T;
  } catch (error: any) {
    console.error(`API Fetch Error [${path}]:`, error);
    throw error;
  }
}
