import { apiFetch } from './api';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  sources: string[];
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  return await apiFetch<ChatResponse>('/api/v1/chat/{session_id}', {
    method: 'POST',
    body: JSON.stringify({ message } as ChatRequest),
  });
}
