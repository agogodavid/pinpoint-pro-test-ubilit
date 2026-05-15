import React, { useState } from 'react';
import { useReviewStore } from '@/hooks/use-review-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReactionType, Comment } from '@shared/types';
const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: 'THUMBS_UP', emoji: '👍' },
  { type: 'CELEBRATE', emoji: '🎉' },
  { type: 'EYES', emoji: '👀' },
  { type: 'CONFUSED', emoji: '😕' },
  { type: 'THUMBS_DOWN', emoji: '👎' },
];
export function PinFeedbackPopover() {
  const session = useReviewStore(s => s.session);
  const selectedPinId = useReviewStore(s => s.selectedPinId);
  const reviewerName = useReviewStore(s => s.reviewerName);
  const updatePinInStore = useReviewStore(s => s.updatePin);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReactions, setLocalReactions] = useState<Set<ReactionType>>(new Set());
  if (!selectedPinId || !session) return null;
  const pin = session.pins.find(p => p.id === selectedPinId);
  if (!pin) return null;
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        userId: reviewerName || 'anonymous',
        userName: reviewerName || 'Reviewer',
        text: commentText.trim(),
        timestamp: Date.now(),
      };
      await api(`/api/sessions/${session.id}/pins/${pin.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ comment: newComment })
      });
      updatePinInStore(pin.id, {
        comments: [...pin.comments, newComment]
      });
      setCommentText('');
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddReaction = async (type: ReactionType) => {
    if (localReactions.has(type)) return;
    try {
      await api(`/api/sessions/${session.id}/pins/${pin.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ reaction: type })
      });
      updatePinInStore(pin.id, {
        reactions: {
          ...pin.reactions,
          [type]: (pin.reactions[type] || 0) + 1
        }
      });
      setLocalReactions(prev => new Set(prev).add(type));
    } catch (err) {
      toast.error("Failed to add reaction");
    }
  };
  return (
    <div className="flex flex-col h-full bg-zinc-900/50 backdrop-blur-md">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">Feedback Point</h3>
        <p className="text-xs text-zinc-400 italic">"{pin.prompt || 'No prompt set'}"</p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {pin.comments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs text-zinc-500">No context provided yet.</p>
              <p className="text-[10px] text-zinc-600 italic">Be the first to share your thoughts.</p>
            </div>
          ) : (
            pin.comments.map(c => (
              <div key={c.id} className="space-y-1.5 bg-zinc-800/30 p-2.5 rounded-lg border border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{c.userName}</span>
                  <span className="text-[9px] text-zinc-600">
                    {formatDistanceToNow(c.timestamp)} ago
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 space-y-4">
        <div className="flex items-center justify-between gap-1">
          {REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => handleAddReaction(r.type)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 p-1 rounded transition-all group border border-transparent",
                localReactions.has(r.type) ? "bg-indigo-600/20 border-indigo-500/30" : "hover:bg-zinc-800"
              )}
            >
              <span className={cn("text-lg group-hover:scale-110 transition-transform", localReactions.has(r.type) && "scale-110")}>{r.emoji}</span>
              <span className="text-[10px] text-zinc-500">{pin.reactions[r.type] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={reviewerName ? `As ${reviewerName}...` : "Type a comment..."}
            className="h-10 text-xs bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-indigo-500/20"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button
            size="icon"
            disabled={!commentText.trim() || isSubmitting}
            onClick={handleAddComment}
            className="h-10 w-10 bg-indigo-600 hover:bg-indigo-500 shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}