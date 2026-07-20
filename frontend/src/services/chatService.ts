import { sendChatMessage } from './api/chat';
import type { ChatMessage } from '@/types';
import { CHAT_SUGGESTION_CHIPS } from './mockData';

// Local session-level chat history
let sessionMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hi, I'm your CareerPilot AI mentor. Ask me anything about your career path, gaps in skills, or how to prepare for interviews!",
    timestamp: 'Just now',
  }
];

export const chatService = {
  getMessages: async (): Promise<ChatMessage[]> => {
    return sessionMessages;
  },
  
  getSuggestionChips: async () => {
    return CHAT_SUGGESTION_CHIPS;
  },
  
  sendMessage: async (content: string): Promise<ChatMessage> => {
    // Add user message to local history
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: 'Just now',
    };
    sessionMessages.push(userMsg);
    
    try {
      const result = await sendChatMessage(content);
      
      let finalContent = result.response;
      if (result.sources && result.sources.length > 0) {
        finalContent += `\n\n*(Sources: ${result.sources.join(', ')})*`;
      }
      
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: finalContent,
        timestamp: 'Just now',
      };
      
      sessionMessages.push(assistantMsg);
      return assistantMsg;
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${e.message || 'Unable to connect to AI Coach backend.'}`,
        timestamp: 'Just now',
      };
      sessionMessages.push(errorMsg);
      return errorMsg;
    }
  },
  
  clearChat: () => {
    sessionMessages = [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi, I'm your CareerPilot AI mentor. Ask me anything about your career path, gaps in skills, or how to prepare for interviews!",
        timestamp: 'Just now',
      }
    ];
  }
};
