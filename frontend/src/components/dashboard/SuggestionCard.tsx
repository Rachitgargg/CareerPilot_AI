import { Sparkles } from 'lucide-react';
import type { Suggestion } from '@/types';
import { Button } from '@/components/ui/button';

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <div className="bg-surface-container-low rounded-panel p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
        <p className="font-body-md text-body-md text-on-surface">{suggestion.message}</p>
      </div>
      <Button variant="soft" size="sm" className="self-start">
        {suggestion.actionLabel}
      </Button>
    </div>
  );
}
