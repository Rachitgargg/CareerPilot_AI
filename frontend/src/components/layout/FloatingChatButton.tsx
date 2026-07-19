import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FloatingChatButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/chat')}
      aria-label="Open AI chat"
      className="fixed bottom-20 md:bottom-8 right-6 md:right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 hover:shadow-[0_20px_40px_-15px_rgba(26,26,26,0.3)]"
    >
      <MessageCircle size={26} />
    </button>
  );
}
