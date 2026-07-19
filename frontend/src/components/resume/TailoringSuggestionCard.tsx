import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { TailoringSuggestion } from '@/types';
import { Button } from '@/components/ui/button';

export interface TailoringSuggestionCardProps {
  suggestion: TailoringSuggestion;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function TailoringSuggestionCard({ suggestion, onAccept, onReject }: TailoringSuggestionCardProps) {
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);

  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
      <div className="bg-blush-deep/40 rounded-xl p-4">
        <p className="font-metadata text-metadata text-on-surface-variant mb-1">Original</p>
        <p className="font-body-md text-body-md text-on-surface line-through decoration-error/40">
          {suggestion.original}
        </p>
      </div>
      <div className="bg-sage-deep/40 rounded-xl p-4">
        <p className="font-metadata text-metadata text-on-surface-variant mb-1">Suggested</p>
        <p className="font-body-md text-body-md text-on-surface">{suggestion.suggested}</p>
      </div>
      <p className="font-metadata text-metadata text-on-surface-variant italic">{suggestion.reason}</p>

      {decision === null ? (
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setDecision('accepted');
              onAccept?.(suggestion.id);
            }}
          >
            <Check size={16} /> Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDecision('rejected');
              onReject?.(suggestion.id);
            }}
          >
            <X size={16} /> Reject
          </Button>
        </div>
      ) : (
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
          {decision === 'accepted' ? 'Accepted' : 'Rejected'}
        </span>
      )}
    </div>
  );
}
