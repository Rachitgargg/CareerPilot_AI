import { withLatency } from './apiClient';
import { CHAT_MESSAGES, CHAT_SUGGESTION_CHIPS } from './mockData';
import type { ChatMessage } from '@/types';

export const chatService = {
  getMessages: () => withLatency(CHAT_MESSAGES),
  getSuggestionChips: () => withLatency(CHAT_SUGGESTION_CHIPS),
  sendMessage: (_content: string): Promise<ChatMessage> =>
    withLatency(
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content:
          "Thanks for sharing that. Based on what you've told me, let's break this down into a structured response using the STAR method.",
        timestamp: 'Just now',
      },
      700
    ),
};
