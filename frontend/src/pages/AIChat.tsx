import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { ChatMessage, ChatSuggestionChip } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/avatar';
import { chatService } from '@/services/chatService';
import { CURRENT_USER } from '@/services/mockData';
import { cn } from '@/utils/cn';

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chips, setChips] = useState<ChatSuggestionChip[]>([]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.getMessages().then(setMessages);
    chatService.getSuggestionChips().then(setChips);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsThinking(true);
    const reply = await chatService.sendMessage(content);
    setIsThinking(false);
    setMessages((prev) => [...prev, reply]);
  };

  return (
    <AppLayout header={{ title: 'AI Career Coach' }} fullBleed hideChatButton>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 md:px-container-padding py-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex gap-3 items-end', message.role === 'user' && 'flex-row-reverse')}
              >
                {message.role === 'assistant' ? (
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                ) : (
                  <Avatar src={CURRENT_USER.avatarUrl} size="sm" />
                )}
                <div
                  className={cn(
                    'rounded-card px-5 py-3 max-w-lg',
                    message.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-md'
                      : 'bg-surface-container-low text-on-surface rounded-bl-md'
                  )}
                >
                  <p className="font-body-md text-body-md">{message.content}</p>
                  <span
                    className={cn(
                      'font-metadata text-metadata block mt-2',
                      message.role === 'user' ? 'text-on-primary/60' : 'text-on-surface-variant'
                    )}
                  >
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex gap-3 items-end">
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="rounded-card rounded-bl-md px-5 py-3 bg-surface-container-low">
                  <span className="font-metadata text-metadata text-on-surface-variant">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-surface-variant px-4 md:px-container-padding py-4 flex flex-col gap-3">
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleSend(chip.label)}
                  className="whitespace-nowrap rounded-full bg-surface-variant px-4 py-2 font-metadata text-metadata text-on-surface hover:bg-surface-dim transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(draft);
              }}
              className="flex items-center gap-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask your AI career coach anything..."
                className="flex-1 h-12 rounded-full bg-surface-container-highest px-6 font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
